const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Headers para simular um navegador (usado em ambas as requisições)
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// --- Função Reutilizável de Scraping ---
// Esta função aceita uma URL e retorna a lista de apps encontrados nela
async function scrapeSource(url) {
    try {
        const response = await axios.get(url, { headers: HEADERS });
        const htmlText = response.data;
        const $ = cheerio.load(htmlText);
        
        const appSections = $('details[data-det]');
        const appsFound = [];

        appSections.each((index, element) => {
            const section = $(element);
            const titleTag = section.find('.t');
            const logoTag = section.find('.img.lazy');
            const linkTags = section.find('div > a');

            if (!titleTag.text()) return;

            if (linkTags.length > 0) {
                const title = titleTag.text().trim().replace(/\s\s+/g, ' ');
                const logoUrl = extractLogoUrl(logoTag);
                const downloadLinks = [];

                linkTags.each((i, linkEl) => {
                    const linkTag = $(linkEl);
                    const href = linkTag.attr('href') || '';
                    const text = linkTag.text().trim();
                    const downloadInfo = extractDownloadLink(href);
                    
                    if (downloadInfo) {
                        downloadLinks.push({ 
                            text: text, 
                            href: downloadInfo.url, 
                            type: downloadInfo.type 
                        });
                    }
                });

                if (downloadLinks.length > 0) {
                    appsFound.push({
                        title: title,
                        logoUrl: logoUrl,
                        links: downloadLinks
                    });
                }
            }
        });

        return appsFound;

    } catch (error) {
        console.error(`Erro ao fazer scraping de ${url}:`, error.message);
        return []; // Retorna lista vazia em caso de erro para não quebrar tudo
    }
}

// --- Rota da API Principal ---
app.get('/api/scrape', async (req, res) => {
    // Definimos as duas fontes de dados
    const instaModURL = 'https://www.instamod.app/?m=1';
    const youtubeProURL = 'https://www.youtubepro.app/?m=1';

    try {
        // Promise.all executa as duas requisições AO MESMO TEMPO (paralelo)
        // Isso deixa o carregamento mais rápido do que fazer um depois do outro
        const [instaApps, youtubeApps] = await Promise.all([
            scrapeSource(instaModURL),
            scrapeSource(youtubeProURL)
        ]);

        // Junta as duas listas
        const allApps = [...instaApps, ...youtubeApps];

        if (allApps.length === 0) {
            return res.status(404).json({ error: 'Nenhum app encontrado em nenhum dos sites.' });
        }

        res.json(allApps);

    } catch (error) {
        console.error('Erro geral no servidor:', error.message);
        res.status(500).json({ error: 'Falha interna ao buscar dados.' });
    }
});

// --- Funções Auxiliares ---
function extractDownloadLink(href) {
    if (!href) return null;
    const urls = href.split(',');
    
    for (const url of urls) {
        const trimmedUrl = url.trim();
        if (trimmedUrl.includes('mediafire.com')) {
            return { url: trimmedUrl, type: 'mediafire' };
        }
        if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('drive.usercontent.google.com')) {
            return { url: trimmedUrl, type: 'gdrive' };
        }
        if (trimmedUrl.includes('mega.nz')) {
            return { url: trimmedUrl, type: 'mega' };
        }
    }

    // Se tiver mais de um link e nenhum for dos principais, pega o último
    if (urls.length > 1) {
        const lastUrl = urls[urls.length - 1].trim();
        if (!lastUrl.includes('do.fantastindents.com') && lastUrl.startsWith('http')) {
            return { url: lastUrl, type: 'direct' };
        }
    }

    // Se tiver apenas 1 link
    const singleUrl = urls[0].trim();
    if (singleUrl.startsWith('http') && !singleUrl.includes('do.fantastindents.com')) {
        return { url: singleUrl, type: 'direct' };
    }

    return null;
}

function extractLogoUrl(logoTag) {
    if (!logoTag || !logoTag.attr('data-style')) {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%234a5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm15-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' /%3E%3C/svg%3E";
    }
    const dataStyle = logoTag.attr('data-style') || '';
    const match = dataStyle.match(/url\((.*?)\)/);
    return match ? match[1].replace(/['"]/g, '') : '';
}

// --- Servir o Frontend ---
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
