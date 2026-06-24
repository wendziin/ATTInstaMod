# 📱 ATTInstaMod Downloader

**ATTInstaMod** é uma central de download automatizada e inteligente para os principais mods Android, focado em **Instagram Mods** (como InstaPro, Insta Thunder, InXta) e **YouTube Pro / MicroG**. 

O projeto é um **PWA (Progressive Web App)** completo, o que significa que ele pode ser instalado como um aplicativo nativo diretamente no celular ou computador, proporcionando carregamentos ultra-rápidos e uma interface totalmente integrada ao sistema.

---

## 🌟 Funcionalidades

* **🔍 Busca em Tempo Real:** Filtre facilmente seus aplicativos favoritos utilizando a barra de busca inteligente.
* **🏷️ Filtros por Categoria:** Navegue rapidamente pelas abas dedicadas a *Instagram Mods* ou *YouTube Pro / MicroG*.
* **⚡ Multi-Servidores Inteligente:** O backend faz scraping em tempo real das fontes oficiais e extrai links do **MediaFire**, **Google Drive** e **Mega**, garantindo resiliência e velocidade de download.
* **🎨 Design Dark Premium:** Interface moderna estilo *glassmorphism* com tema escuro e detalhes em neon pink, adaptável a qualquer tela.
* **📱 Suporte PWA (App Instalável):** Adicione o aplicativo à tela inicial do seu celular e tenha acesso direto aos seus downloads em um clique.
* **🌀 Shimmer Loader:** Indicadores visuais animados enquanto a lista de aplicativos é atualizada pela API.

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js & Express
* **Web Scraping:** Axios & Cheerio
* **Frontend:** HTML5, CSS3, Tailwind CSS (CDN) & JavaScript (ES6)
* **PWA:** Manifest.json & Service Workers para suporte a instalação e cache offline básico.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Você precisa do [Node.js](https://nodejs.org/) instalado em seu sistema.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/wendziin/ATTInstaMod.git
   cd ATTInstaMod
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor local:**
   ```bash
   node server.js
   ```

4. **Acesse no seu navegador:**
   Abra `http://localhost:3000` para visualizar o site e testar a instalação do PWA.

---

## 🌐 Deploy em Produção

O projeto está configurado para deploy contínuo em serviços de hospedagem como o **Render**.

### Como publicar suas alterações:
Para fazer o commit e push das alterações para o repositório remoto:
```bash
git add .
git commit -m "feat: adicionar README e suporte completo PWA"
git push origin main
```

O Render (ou outra plataforma conectada ao seu repositório Git) irá compilar e publicar automaticamente a nova versão estável do seu site.
