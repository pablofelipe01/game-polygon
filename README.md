# ⚡ Code Quest — Fundación Guaicaramo

Juego educativo **Play-to-Earn** desplegado en **Polygon Mainnet**.
Aprende HTML, CSS y JavaScript mientras ganas tokens FGT reales en la blockchain.

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Blockchain:** Polygon Mainnet (Chain ID: 137)
- **Wallet:** Phantom (EIP-1193)
- **Web3:** ethers.js v5

---

## Paso 1: Deploy de Contratos

### FGToken.sol

1. Abre [Remix IDE](https://remix.ethereum.org)
2. Crea un archivo `FGToken.sol` y pega el contenido de `contracts/FGToken.sol`
3. Compila con **Solidity 0.8.20**
4. En la pestaña "Deploy & Run":
   - Environment: **Injected Provider** (Phantom)
   - Asegúrate de estar en **Polygon Mainnet**
5. Haz clic en **Deploy**
6. Copia la dirección del contrato desplegado

### GamePass.sol

1. Crea un archivo `GamePass.sol` en Remix
2. Pega el contenido de `contracts/GamePass.sol`
3. Compila con **Solidity 0.8.20**
4. En Deploy, pasa la dirección de tu MASTER_WALLET como parámetro del constructor
5. Haz clic en **Deploy**
6. Copia la dirección del contrato desplegado

### Configurar Minter

En Remix, en el contrato FGToken desplegado:
1. Llama a la función `setMinter`
2. Pasa la dirección de tu **MASTER_WALLET** (la misma que usarás como clave privada en el backend)

---

## Paso 2: Configurar el Proyecto

```bash
# Clonar repositorio
git clone <tu-repo-url>
cd code-quest

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
MASTER_WALLET_PRIVATE_KEY=tu_clave_privada
FG_TOKEN_ADDRESS=0x...
GAME_PASS_ADDRESS=0x...
NEXT_PUBLIC_FG_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_GAME_PASS_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_CHAIN_ID=137
```

> **IMPORTANTE:** `MASTER_WALLET_PRIVATE_KEY` nunca debe ser expuesta al cliente.
> Las variables sin prefijo `NEXT_PUBLIC_` solo son accesibles en el servidor.

---

## Paso 3: Desarrollo Local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador con Phantom instalado.

---

## Paso 4: Deploy en Vercel

```bash
# Instalar Vercel CLI (si no la tienes)
npm i -g vercel

# Deploy
vercel
```

En el [Dashboard de Vercel](https://vercel.com):
1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega TODAS las variables de `.env.local`
3. Haz redeploy

---

## Estructura del Juego

### 3 Mundos Educativos

| Mundo | Tema | Requisito | Actividades |
|-------|------|-----------|-------------|
| 1 | HTML | Gratis | 6 preguntas + 4 mini juegos |
| 2 | CSS | 50 FGT | 6 preguntas + 4 mini juegos |
| 3 | JavaScript | 150 FGT | 6 preguntas + 4 mini juegos |

### Mini Juegos

- **Space Invaders** — Destruye enemigos con tags de código (15 FGT)
- **Snake** — Recolecta 10 tags de código (15 FGT)
- **Memory Cards** — Empareja 8 pares de conceptos (15 FGT)
- **Quiz Timer** — 10 preguntas en 60 segundos (3-25 FGT según score)

### Tokenomics

- **Token:** FGT (Fundacion Guaicaramo Token)
- **Red:** Polygon Mainnet
- **Supply máximo:** 10,000,000 FGT
- **Magic Pass:** 0.5 POL (pago único)

---

## Seguridad

- La clave privada de la MASTER_WALLET solo vive en las API Routes del servidor
- Cada recompensa requiere firma EIP-191 del jugador
- Sistema anti-cheat con gameIds únicos (no se puede reclamar dos veces)
- En producción, reemplazar `rewardedGames.json` por Redis o base de datos

---

## Licencia

MIT — Fundación Guaicaramo 2024
