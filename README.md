
# Sistem CRM Kesehatan

## Deskripsi Proyek

Proyek ini adalah implementasi dari sistem CRM (Customer Relationship Management) untuk layanan kesehatan, yang dibangun menggunakan arsitektur layanan mikro. Sistem ini terdiri dari beberapa layanan yang berinteraksi untuk menyediakan fungsionalitas otentikasi pengguna, obrolan waktu-nyata, dan manajemen data.

## Arsitektur

Arsitektur sistem ini terdiri dari layanan-layanan berikut:

- **API Gateway**: Titik masuk tunggal untuk semua permintaan klien. Gateway ini menggunakan Apollo Federation untuk menggabungkan skema GraphQL dari `auth-service` dan `chat-service` menjadi satu supergraf.
- **Auth Service**: Bertanggung jawab untuk otentikasi dan manajemen pengguna. Layanan ini menyediakan mutasi GraphQL untuk pendaftaran (`register`) dan masuk (`login`), serta kueri untuk memvalidasi token (`validateToken`). Kata sandi di-hash menggunakan `bcryptjs` dan token JWT digunakan untuk otorisasi.
- **Chat Service**: Mengelola fungsionalitas obrolan. Layanan ini menyediakan kueri dan mutasi GraphQL untuk membuat ruang obrolan, mengirim pesan, dan mengambil riwayat obrolan. Pesan tidak langsung disimpan ke basis data; sebaliknya, mereka dipublikasikan ke antrian pesan RabbitMQ.
- **Chat Worker**: Layanan ini mendengarkan pesan dari antrian RabbitMQ. Ketika sebuah pesan diterima, pekerja akan menyimpannya ke dalam basis data. Ini juga mencakup logika untuk penanganan percobaan ulang (retry) jika terjadi kegagalan penyimpanan dan mekanisme Antrian Surat Mati (Dead Letter Queue/DLQ) untuk pesan yang gagal diproses setelah beberapa kali percobaan. Redis digunakan untuk mencegah pemrosesan pesan duplikat.
- **Frontend**: Aplikasi React sisi klien yang menyediakan antarmuka pengguna untuk berinteraksi dengan sistem. Ini menggunakan Apollo Client untuk berkomunikasi dengan API Gateway melalui GraphQL, termasuk kueri, mutasi, dan langganan untuk fungsionalitas obrolan waktu-nyata.
- **Database**: Dua basis data PostgreSQL yang terpisah digunakan: satu untuk `auth-service` dan satu untuk `chat-service`, memastikan isolasi data antar layanan.
- **RabbitMQ**: Broker pesan yang digunakan untuk komunikasi asinkron antara `chat-service` dan `chat-worker`.
- **Redis**: Digunakan oleh `chat-worker` untuk pelacakan pesan dan mencegah duplikasi.

## Menjalankan Proyek

Untuk menjalankan seluruh tumpukan aplikasi, Anda memerlukan Docker dan Docker Compose.

1.  **Bangun dan Jalankan Kontainer**:
    Dari direktori root proyek, jalankan perintah berikut:
    ```bash
    docker-compose up --build
    ```
    Perintah ini akan membangun image untuk setiap layanan (jika belum ada) dan memulai semua kontainer.

2.  **Akses Layanan**:
    - **API Gateway**: `http://localhost:3000/graphql`
    - **Frontend**: `http://localhost:5173`
    - **RabbitMQ Management**: `http://localhost:15672` (login dengan `user`/`password`)

## Struktur Proyek

```
/
├── docker-compose.yml
├── frontend/
│   └── ... (Aplikasi React)
├── services/
│   ├── api-gateway/
│   │   └── ... (NestJS Apollo Gateway)
│   ├── auth-service/
│   │   └── ... (Layanan Otentikasi NestJS)
│   ├── chat-service/
│   │   └── ... (Layanan Obrolan NestJS)
│   └── chat-worker/
│       └── ... (Pekerja Konsumen RabbitMQ NestJS)
└── README.md
```

## Penggunaan API (Contoh GraphQL)

Anda dapat berinteraksi dengan API melalui Apollo Studio di `http://localhost:3000/graphql`.

### Otentikasi

**Registrasi Pengguna Baru**
```graphql
mutation Register($email: String!, $password: String!) {
  register(registerInput: { email: $email, password: $password }) {
    token
  }
}
```

**Login Pengguna**
```graphql
mutation Login($email: String!, $password: String!) {
  login(loginInput: { email: $email, password: $password }) {
    token
  }
}
```

### Obrolan

**Membuat Ruang Obrolan**
```graphql
mutation CreateChatRoom($userIds: [String!]!) {
  createChatRoom(createChatRoomInput: { userIds: $userIds }) {
    id
  }
}
```

**Mengirim Pesan**
```graphql
mutation SendMessage($chatRoomId: String!, $senderId: String!, $content: String!) {
  sendMessage(sendMessageInput: { chatRoomId: $chatRoomId, senderId: $senderId, content: $content }) {
    status
  }
}
```

**Mendapatkan Ruang Obrolan**
```graphql
query GetChatRooms {
  chatRooms {
    id
    users {
      user {
        id
        email
      }
    }
  }
}
```

**Berlangganan Pesan Baru**
```graphql
subscription MessageSent($chatRoomId: String!) {
  messageSent(chatRoomId: $chatRoomId) {
    id
    content
    senderId
    createdAt
  }
}
```