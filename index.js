var request = require('request')
const cheerio = require('cheerio')
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const cookieJar = request.jar();
request = request.defaults({ jar: cookieJar })
const hook = new Webhook("");
var productURL = 'https://japanwhiskys.com/japanischer-whisky/chichibu/496/chichibu-ghost-12-bourbon-barrel-10-years-old-cask-554?c=17'

let available;
let sent = false;

function monitor(productURL) {
    request(productURL, function (error, response, html) {
        const $ = cheerio.load(html);
        if ($('link[itemprop="availability"]').attr('href') === 'http://schema.org/InStock' && sent === true) {
            monitor(productURL);
        }
        if ($('.article--announced').html() !== null) {
            console.log('Product Out of Stock retrying...');
            available = false;
            sent = false;
            monitor(productURL);
        } else {
            if ($('link[itemprop="availability"]').attr('href') === 'http://schema.org/InStock') {
                var link = $('meta[itemprop="url"]').attr('content')
                var price = $('meta[itemprop="price"]').attr('content')
                var img = $('a[class="thumbnail--link is--active"]').attr('href')
                var title = $('h1[class="product--title"]').text()
                console.log(`Product found with title ${title}!`)
                available = true;
            }
        }
        if (available === true && sent === false) {
            const embed = new MessageBuilder()
                .setTitle(title)
                .addField('Produkt', `[LINK](${link})`)
                .setColor(8190976)
                .setThumbnail(img)
                .setDescription(`Preis: ${price}€`)
                .setFooter('La Familia', 'https://cdn.discordapp.com/attachments/647028936710029332/669253702342803477/LA-FAMILIA-Discord_512x512px.png')
                .setTimestamp();
            hook.send(embed);
            sent = true;
            monitor(productURL)
        }
    })
}

monitor(productURL)
