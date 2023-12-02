'use client';
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export default function SubscriptionItem({session, sub}) {
    console.log(sub)

    async function buySubscription() {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 30)
        const formattedExpirationDate = expirationDate.toISOString().split('T')[0]

        const formData = new FormData()
        formData.append('user', session.user.user_id)
        formData.append('subscription', sub.id)
        formData.append('expiration_date', formattedExpirationDate)

        const response = await fetch(`api/v1/subscriptions/${sub.id}/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.access}`
            },
            body: formData
        })
        if (response.status === 201) {
            console.log('SUCCESS')
        }
    }

    return (
        <div className={`w-full h-full flex flex-col gap-3 p-5`}>
            <p>{sub.name}</p>
            <p>{sub.description}</p>
            <p>{sub.price}</p>
            <p>{sub.likes_limit}</p>
            <SecondaryButton
                text={"SUBSCRIBE"}
                onClickHandler={buySubscription}
            />
        </div>
    )
}
