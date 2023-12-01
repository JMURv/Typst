export default async function resetPassword(recoveryEmail){
    return await fetch(`api/v1/forgot-password/?email=${recoveryEmail}`, {
        method: "GET"
    })
}
