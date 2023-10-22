export default async function resetPassword(recoveryEmail){
    return await fetch(`api/v1/users/forgot-password/?email=${recoveryEmail}`, {
        method: "GET"
    })
}