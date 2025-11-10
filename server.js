const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); // Equivalente ao BeautifulSoup em Node.js
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // O Render define a porta automaticamente

// --- Rota da API para Scraping ---
app.get('/api/scrape', async (req, res) => {
    const targetURL = 'https://www.instamod.app/?m=1';
    
    // Headers para simular um navegador
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    try {
        const response = await axios.get(targetURL, { headers });
        const htmlText = response.data;

        // Carrega o HTML no Cheerio (nosso "BeautifulSoup")
        const $ = cheerio.load(htmlText);

        const appSections = $('details[data-det]');
        
        if (appSections.length === 0) {
            return res.status(404).json({ error: 'Nenhuma seção de app encontrada. O site pode ter mudado.' });
        }

        const appsData = [];

        appSections.each((index, element) => {
            const section = $(element);
            const titleTag = section.find('.t');
            const logoTag = section.find('.img.lazy');
            const linkTags = section.find('div > a'); // Links dentro da div
            
            if (!titleTag.text()) {
                return; // Pula seções sem título
            }

            if (linkTags.length > 0) {
                const title = titleTag.text().trim().replace(/\s\s+/g, ' '); // Limpa o título
                const logoUrl = extractLogoUrl(logoTag);
                const downloadLinks = [];

                linkTags.each((i, linkEl) => {
                    const linkTag = $(linkEl);
                    const href = linkTag.attr('href') || '';
                    const text = linkTag.text().trim();
                    const mediafireLink = extractMediaFireLink(href);
                    
                    if (mediafireLink) {
                        downloadLinks.push({
                            text: text,
                            href: mediafireLink
                        });
                    }
                });

                if (downloadLinks.length > 0) {
                    appsData.push({
                        title: title,
                        logoUrl: logoUrl,
                        links: downloadLinks
                    });
                }
            }
        });

        // Envia os dados como JSON
        res.json(appsData);

    } catch (error) {
        console.error('Erro no scraping:', error.message);
        res.status(500).json({ error: 'Falha ao buscar dados do site de origem.' });
    }
});

// --- Funções Auxiliares de Scraping ---
function extractMediaFireLink(href) {
    const urls = href.split(',');
    for (const url of urls) {
        if (url.includes('mediafire.com')) {
            return url.trim();
        }
    }
    return null;
}

function extractLogoUrl(logoTag) {
    if (!logoTag || !logoTag.attr('data-style')) {
        // Retorna um placeholder SVG
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%234a5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm15-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' /%3E%3C/svg%3E";
    }
    const dataStyle = logoTag.attr('data-style') || '';
    const match = dataStyle.match(/url\((.*?)\)/);
    return match ? match[1].replace(/['"]/g, '') : '';
}

// --- Servir o Frontend ---
// Informa ao Express para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal para servir o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});