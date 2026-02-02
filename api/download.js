const axios = require('axios')
const cheerio = require('cheerio')

module.exports = async (req, res) => {
    const { url } = req.query
    if (!url) {
        return res.status(400).json({ status:false, msg:"url missing" })
    }

    try {
        // 1️⃣ Rareanimes page
        const { data } = await axios.get(url)
        const $ = cheerio.load(data)

        const title = $('title').text().trim()

        // 2️⃣ codedew link
        let codedew = null
        $('a').each((i, el) => {
            const h = $(el).attr('href')
            if (h && h.includes('codedew.com/multiquality')) codedew = h
        })

        if (!codedew) {
            return res.json({ status:false, msg:"download page not found" })
        }

        // 3️⃣ codedew download links
        const { data: d2 } = await axios.get(codedew)
        const $2 = cheerio.load(d2)

        let downloads = []
        $2('a').each((i, el) => {
            const link = $2(el).attr('href')
            const text = $2(el).text().trim()
            if (link && /480|720|1080/i.test(text)) {
                downloads.push({ quality: text, link })
            }
        })

        return res.json({
            status: true,
            title,
            source: codedew,
            downloads
        })

    } catch (e) {
        return res.status(500).json({ status:false, error: e.message })
    }
}
