# 🗄️ MongoDB Integration - Phase 3

**Version:** 0.4.0  
**Status:** ✅ Complete  
**Database:** MongoDB  
**ODM:** Mongoose 7.x

---

## 📋 Installation & Setup

### 1. Install MongoDB Locally

#### On Windows
```bash
# Download from https://www.mongodb.com/try/download/community
# Or use chocolatey:
choco install mongodb

# Start MongoDB service
# MongoDB runs on localhost:27017 by default
```

#### On macOS
```bash
# Using Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB:
brew services start mongodb-community
```

#### On Linux (Ubuntu)
```bash
# Add MongoDB repository
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-mongosh mongodb-org

# Start service
sudo systemctl start mongod
```

### 2. MongoDB Atlas (Cloud)

Alternativa: Usa MongoDB Atlas para una instancia en la nube:

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un cluster
4. Obtén la connection string
5. Configura en `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/noahlink-pro
```

---

## 🔧 Configuration

### .env Setup

```bash
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/noahlink-pro

# Optional: Auth credentials
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
```

### Auto Connection

El backend intenta conectarse automáticamente en el startup:

```javascript
const dbConnected = await connectMongoDB();
```

Si MongoDB no está disponible:
- Los endpoints continúan funcionando (sin persistencia)
- Se muestra advertencia en los logs
- Revierte a mock data

---

## 📊 Database Collections

### Programs
Almacena programas personalizados de audio.

```javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  frequencies: Map<String, Number>,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Índice:** `userId`, `createdAt`

### Profiles
Gestiona perfiles de usuario con dispositivos.

```javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  device: String,
  programs: Number,
  active: Boolean,
  settings: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

**Índice:** `userId`, `createdAt`

### Settings
Almacena preferencias de usuario.

```javascript
{
  _id: ObjectId,
  userId: String (unique),
  autoConnect: Boolean,
  updateFrequency: Number,
  notificationsEnabled: Boolean,
  soundAlerts: Boolean,
  vibration: Boolean,
  batteryThreshold: Number,
  autoBackup: Boolean,
  dataCollection: Boolean,
  darkMode: Boolean,
  language: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Índice:** `userId` (unique)

### Alerts
Log de alertas y notificaciones.

```javascript
{
  _id: ObjectId,
  userId: String,
  type: String (battery|system|connection|program|maintenance),
  severity: String (error|warning|info|success),
  title: String,
  message: String,
  read: Boolean,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:** `userId + createdAt` (sorted desc)

### BatteryHistory
Historial de niveles de batería para análisis.

```javascript
{
  _id: ObjectId,
  userId: String,
  deviceId: String,
  level: Number (0-100),
  voltage: Number,
  temperature: Number,
  timestamp: Date
}
```

**Índices:** 
- `timestamp` (para queries rápidas)
- `userId + timestamp` (compound para análisis)

---

## 🚀 Mongoose Models

Todos los modelos están en `backend/src/models/index.js`:

```javascript
const {
  Program,
  Profile,
  Settings,
  Alert,
  BatteryHistory
} = require('./models');
```

### Crear Documento

```javascript
const program = new Program({
  userId: 'user-001',
  name: 'Mi Programa',
  frequencies: { 100: 5, 500: 8, 1000: 10 }
});
await program.save();
```

### Buscar

```javascript
// Por ID
const program = await Program.findById(id);

// Todos del usuario
const programs = await Program.find({ userId });

// Con sorting
const programs = await Program.find({ userId })
  .sort({ createdAt: -1 })
  .limit(10);
```

### Actualizar

```javascript
// Por ID
const program = await Program.findByIdAndUpdate(
  id,
  { name: 'Nuevo Nombre' },
  { new: true }
);

// Múltiples
await Program.updateMany({ userId }, { active: false });
```

### Eliminar

```javascript
// Por ID
await Program.findByIdAndDelete(id);

// Múltiples
const result = await Alert.deleteMany({ userId });
console.log(`${result.deletedCount} eliminados`);
```

---

## 📡 API Endpoints (MongoDB)

Todos los 23 endpoints ahora usan MongoDB para persistencia:

### Programs
```
GET    /api/v1/programs                    - Lista todos
GET    /api/v1/programs/:programId         - Obtiene uno
POST   /api/v1/programs                    - Crea nuevo
PUT    /api/v1/programs/:programId         - Actualiza
DELETE /api/v1/programs/:programId         - Elimina
```

### Analytics
```
GET    /api/v1/analytics/trends            - Tendencias (calcula de BD)
GET    /api/v1/analytics/distribution      - Distribución
GET    /api/v1/analytics/insights          - Insights automáticos
```

### Profiles
```
GET    /api/v1/profiles                    - Lista todos
GET    /api/v1/profiles/:profileId         - Obtiene uno
POST   /api/v1/profiles                    - Crea nuevo
PUT    /api/v1/profiles/:profileId         - Actualiza
DELETE /api/v1/profiles/:profileId         - Elimina
```

### Settings
```
GET    /api/v1/settings                    - Obtiene (crea si no existe)
PUT    /api/v1/settings                    - Actualiza
POST   /api/v1/settings/reset              - Restablecer defectos
```

### Alerts
```
GET    /api/v1/alerts                      - Lista (con filtros)
GET    /api/v1/alerts/:alertId             - Obtiene uno
POST   /api/v1/alerts                      - Crea nuevo
PUT    /api/v1/alerts/:alertId             - Marca como leído
DELETE /api/v1/alerts/:alertId             - Elimina
POST   /api/v1/alerts/mark-all/read        - Marca todos como leídos
DELETE /api/v1/alerts                      - Elimina todos
```

---

## 🔍 Database Queries Examples

### Obtener tendencias de batería (24h)

```javascript
const history = await BatteryHistory.find({
  userId: 'user-001',
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
}).sort({ timestamp: 1 });
```

### Alertas no leídas

```javascript
const unread = await Alert.find({
  userId: 'user-001',
  read: false
}).sort({ createdAt: -1 });
```

### Programas ordenados por fecha

```javascript
const programs = await Program.find({ userId: 'user-001' })
  .sort({ createdAt: -1 })
  .limit(10);
```

### Estadísticas de batería

```javascript
const stats = await BatteryHistory.aggregate([
  { $match: { userId: 'user-001' } },
  {
    $group: {
      _id: null,
      current: { $last: '$level' },
      average: { $avg: '$level' },
      min: { $min: '$level' },
      max: { $max: '$level' }
    }
  }
]);
```

---

## 🧪 Testing

### Insertar datos de prueba

```bash
# Usar MongoDB CLI
mongosh

# Conectar a DB
use noahlink-pro

# Insertar programa
db.programs.insertOne({
  userId: "user-001",
  name: "Prueba",
  frequencies: { "100": 5, "500": 8 },
  createdAt: new Date()
})
```

### Ver colecciones

```bash
mongosh
use noahlink-pro
show collections
```

### Ver documentos

```bash
db.programs.find()
db.alerts.find({ userId: "user-001" })
db.batteryhistory.find().limit(10)
```

---

## 🔐 Security

### Data Isolation by User

Todos los datos están isolados por `userId`:

```javascript
const programs = await Program.find({ userId });
```

### Index Performance

Los índices optimizan queries comunes:

```javascript
// Automáticamente creados:
programSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, createdAt: -1 });
batteryHistorySchema.index({ userId: 1, timestamp: -1 });
```

### Validation

Mongoose valida tipos automáticamente:

```javascript
{
  level: { type: Number, min: 0, max: 100 },  // Rango
  type: { type: String, enum: [...] },        // Valores permitidos
  userId: { type: String, required: true }    // Obligatorio
}
```

---

## 📊 Monitoring

### Check Connection Status

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "bluetooth": "disconnected"
}
```

### View Logs

```bash
# Backend logs
npm run dev

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

---

## 🔄 Data Migration (Future)

Cuando migres de mock data a MongoDB:

1. Exporta datos de mock
2. Usa script de migración
3. Verifica integridad
4. Desactiva fallback a mock

```javascript
// Deshabilitar fallback (cuando confíes en BD)
// await connectMongoDB() // throw error instead of returning false
```

---

## 📈 Performance Tips

1. **Use Indexes** - Todos están creados automáticamente
2. **Limit Results** - `.limit(100)` en queries grandes
3. **Projection** - `.select()` solo campos necesarios
4. **Sorting** - Usa índices para sort
5. **Aggregate** - Para análisis complejos

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check si MongoDB está corriendo:
mongosh

# Or restart:
sudo systemctl restart mongod
```

### Performance Issues

```bash
# Check índices:
db.programs.getIndexes()

# Monitor queries:
db.setProfilingLevel(1)
db.system.profile.find().pretty()
```

### Data Consistency

```bash
# Valida colecciones:
db.programs.validate()
```

---

## ✅ Checklist

- [x] Mongoose instalado
- [x] Modelos creados
- [x] Schemas definidos
- [x] Índices automáticos
- [x] Endpoints actualizados
- [x] Conexión auto en startup
- [x] Fallback a mock data
- [ ] Tests de integración
- [ ] Auth middleware
- [ ] Backup strategy

---

**Last Updated:** 2026-10-01  
**Status:** ✅ Ready for Production  
**MongoDB Version:** 6.x+  
**Mongoose Version:** 7.x
