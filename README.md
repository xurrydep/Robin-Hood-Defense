# Robin Hood Defense — Robinhood Chain Testnet

Kısa açıklama: Bu proje, Robinhood Chain (L2) testnet üzerinde basit bir oyun arayüzü ve örnek bir akıllı kontrat dağıtımı akışı içerir. Dokümanda yer alan adımlar, Robinhood'un resmi rehberine (Deploy Smart Contracts on Robinhood Chain) uygundur.

## Gereksinimler

- Node.js v18+
- npm
- MetaMask veya EVM uyumlu bir cüzdan (tarayıcı eklentisi)
- (Opsiyonel) Bir testnet özel anahtarı ve biraz testnet ETH — kontrat deploy etmek için gerekli

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Geliştirme sunucusunu çalıştırın:

```bash
npm run dev
```

Uygulamayı tarayıcıda açın (Vite çıktısındaki adres, genellikle `http://localhost:5173`).

## Cüzdan Bağlantısı (Frontend)

- Uygulamada sağ üstte veya ana ekranda `Connect Robinhood Wallet` butonuna tıklayarak MetaMask/uygun cüzdan ile bağlanın.
- Uygulama otomatik olarak Robinhood Testnet (`Chain ID: 46630`, hex `0xB626`) ağına geçmeyi deneyir. Eğer cüzdanınızda bu ağ yoksa bir ekleme isteği (`wallet_addEthereumChain`) gönderilir.
- MetaMask onay pencerelerini kabul edin.

Not: Eğer bağlantı başarısız olursa, tarayıcı konsolunda çıkan hatayı kopyalayın ve kontrol edin. Ayrıca MetaMask sürümü güncel olduğundan emin olun.

## Akıllı Kontratı Derleme ve Deploy Etme (Hardhat)

Proje, Robinhood dokümantasyonuna uygun basit bir kontrat (`contracts/HelloRobinhood.sol`) ve deploy script (`scripts/deploy.ts`) içerir.

1. Derleyin:

```bash
npm run compile
```

2. Deploy (Robinhood Testnet):

ÖNEMLİ: Deploy işlemi için bir özel anahtar gereklidir. Bu anahtarı asla projedeki dosyalara yazmayın. Windows PowerShell örneği:

```powershell
$env:PRIVATE_KEY='0xYOUR_TESTNET_PRIVATE_KEY'
npm run deploy:robinhood
```

Veya Unix/macOS terminali:

```bash
export PRIVATE_KEY='0xYOUR_TESTNET_PRIVATE_KEY'
npm run deploy:robinhood
```

Deploy tamamlandığında konsolda kontrat adresini göreceksiniz. (Hardhat, `hardhat.config.ts` içinde Robinhood Testnet RPC ve chainId = 46630 ile konfigüre edilmiştir.)

## Uygulama içi Deploy Akışı

- Mevcut frontend `deployContract` fonksiyonu simule edilmiş bir deploy akışıdır (UI güncellemesi ve iki saniyelik gecikme ile işlem durumunu günceller).
- Eğer isterseniz, bu fonksiyonun yerine cüzdan üzerinden interaktif imzalama (ethers.js ile `getSigner().sendTransaction` veya kontrat deploy) işlevselliği ekleyebilirim.

## Güvenlik ve Gizlilik

- PRIVATE_KEY'i asla repoya, commitlere veya paylaşılabilir dosyalara koymayın.
- Testnet anahtarları küçük risk taşır, ama yine de güvenli bir yerde saklayın.

## İlgili Bağlantılar

- Robinhood docs — Deploy Smart Contracts: https://docs.robinhood.com/chain/deploy-smart-contracts
- RPC URL (Testnet): https://rpc.testnet.chain.robinhood.com
- Block Explorer (Testnet): https://explorer.testnet.chain.robinhood.com

## Yardım / Sonraki Adımlar

- İsterseniz frontend `deployContract` fonksiyonunu gerçek kontrat deploy ve imzalama ile entegre edebilirim (bunu yapmak için `ethers` kullanıp kontrat bytecode/abi ile frontend'den deploy etmem gerekir).
- Ya da deploy sonrası kontrat adresini UI'ye otomatik olarak yazdırma, kontrat doğrulama veya test yazma adımlarını ekleyebilirim.
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/108aOTxHkeI4W66-fa9WG4k0aawjopwec

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
