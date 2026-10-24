# MONTAVELLI — Catálogo e painel

Laravel 13 + React (Inertia) + Tailwind 4. Sem serviços externos: autenticação própria, fontes e ícones (Remix Icon) hospedados localmente, imagens processadas no servidor (Intervention Image + GD).

## Requisitos
PHP 8.3+ (extensões gd, pdo_sqlite ou pdo_mysql, fileinfo, mbstring), Composer, Node 20+.

## Instalação
```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```
No `.env`, defina o primeiro administrador (usado pelo seeder):
```
ADMIN_NAME="Seu nome"
ADMIN_EMAIL=voce@exemplo.com
ADMIN_PASSWORD=uma-senha-forte
```
Banco: SQLite por padrão (`DB_CONNECTION=sqlite`). Para MySQL, ajuste `DB_*`.

```bash
php artisan migrate --seed     # cria só o admin e as configurações padrão
php artisan storage:link
npm run build
php artisan serve
```
Loja: `/` · Admin: `/admin`

## Comandos
- `php artisan montavelli:create-admin` — cria um admin ou troca a senha dele
- `npm run dev` — front em modo desenvolvimento
- `php artisan test` — testes (auth, produtos, imagens, WhatsApp, links, segurança)

## Imagens
Fotos de produto são recortadas na proporção configurada (padrão 4:5) e geradas em WebP + JPEG
(thumb 160, card 600, galeria 1080, zoom 1600), sem EXIF. Disco em `config/montavelli.php`
(`MONTAVELLI_DISK=public`; pode ser `s3` se configurado).

## Marca
A logo oficial está em `public/brand/` (versões para fundo claro e escuro, monograma, favicon).
Cores extraídas da logo: preto `#0B0B0B`, champagne `#CCC2B4`. Tudo é editável em Configurações.
