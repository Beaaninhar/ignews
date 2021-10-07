/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next"
import { query as q } from 'faunadb'
import { getSession } from 'next-auth/client'
import { stripe } from '../../services/stripe'
import { fauna } from "../../services/fauna"
import { SSL_OP_SINGLE_DH_USE } from "constants"

type User = {
    ref: {
        id: string;
    }
    data: {
        stripe_customer_id: string
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {

        const session = await getSession({ req });

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        if ( !customerId ) {
            const stripeCustumer = await stripe.customers.create({
                email: session.user.email,
                // metadata
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustumer.id,
                        }
                    }
                )
            )

            customerId = stripeCustumer.id
        }

        const stripeSheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {
                    price: 'price_1JhNJqKRNMIVvuj4Vm4ZSr5L', quantity: 1
                }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL

        })

        return res.status(200).json({ sessionId: stripeSheckoutSession.id })

    } else {
        res.setHeader('Allow', 'POST    ')
        res.status(405).end('Method not allowed')
    }

}