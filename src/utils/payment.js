import Stripe from "stripe";


async function payment({
    stripe = new Stripe(process.env.STRIPE_SECRET),
    payment_method_types = ['card'],
    mode = 'payment',
    metadata = {},
    customer_email,
    line_items=[],
    discounts = [],
    cancel_url=process.env.CANCEL_URL,
    success_url=process.env.SUCCESS_URL
} = {}) {
    const session = await stripe.checkout.sessions.create({
        payment_method_types,
        mode,
        metadata,
        customer_email,
        line_items,
        discounts,
        cancel_url,
        success_url
    })
    return session
}
export default payment