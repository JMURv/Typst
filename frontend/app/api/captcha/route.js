
const baseGoogleUrl = 'https://www.google.com/recaptcha/api/siteverify'


export async function GET(req, res) {
    res.status(405)
}


export async function POST(req, res) {
    return res.status(200).json({ text: 'Hello' });
    if (req.method === "POST") {
        const recaptchaToken = req.body.recaptchaToken;
        const reCaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY
        console.log(reCaptchaSecretKey)
        const response = await fetch(`${baseGoogleUrl}?secret=${reCaptchaSecretKey}&response=${recaptchaToken}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            },
            method: "POST",
        })
        const data = await response.json()
        console.log(data)
        if (data.success) {
            res.status(200).json({success: true})
        } else {
            res.status(400).json({success: false})
        }
    }
}