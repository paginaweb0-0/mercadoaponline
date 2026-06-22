// datos.js — cerebro de la app, maneja todos los datos

// ─── Datos de ejemplo para empezar ───────────────────────────────
const DATOS_INICIALES = {
  mercados: [
    { id: "m1", nombre: "Mercado Central", direccion: "Calle 10 # 5-23", activo: true },
    { id: "m2", nombre: "Tienda La Esquina", direccion: "Carrera 8 # 12-45", activo: true },
  ],
  productos: [
    { id: "p1", mercadoId: "m1", nombre: "Tomate", categoria: "Verduras", precio: 2800, unidad: "kg", imagen: "🍅", enOferta: false, ofertaDesc: "" },
    { id: "p2", mercadoId: "m1", nombre: "Papa criolla", categoria: "Verduras", precio: 1900, unidad: "kg", imagen: "🥔", enOferta: true, ofertaDesc: "20% de descuento" },
    { id: "p3", mercadoId: "m1", nombre: "Pechuga de pollo", categoria: "Carnes", precio: 12000, unidad: "kg", imagen: "🍗", enOferta: false, ofertaDesc: "" },
    { id: "p4", mercadoId: "m2", nombre: "Manzana", categoria: "Frutas", precio: 4500, unidad: "kg", imagen: "🍎", enOferta: false, ofertaDesc: "" },
    { id: "p5", mercadoId: "m2", nombre: "Leche", categoria: "Lácteos", precio: 2200, unidad: "litro", imagen: "🥛", enOferta: true, ofertaDesc: "Precio especial semana" },
    { id: "p6", mercadoId: "m2", nombre: "Huevos", categoria: "Lácteos", precio: 13000, unidad: "docena", imagen: "🥚", enOferta: false, ofertaDesc: "" },
    { id: "p7", mercadoId: "m1", nombre: "Arroz", categoria: "Granos", precio: 3200, unidad: "kg", imagen: "🌾", enOferta: false, ofertaDesc: "" },
  ],
  usuarios: [
    // Los mercaderes se registran y quedan aquí
  ]
};

// ─── Inicializar datos si no existen ─────────────────────────────
function inicializar() {
  if (!localStorage.getItem("mercados")) {
    localStorage.setItem("mercados", JSON.stringify(DATOS_INICIALES.mercados));
  }
  if (!localStorage.getItem("productos")) {
    localStorage.setItem("productos", JSON.stringify(DATOS_INICIALES.productos));
  }
  if (!localStorage.getItem("usuarios")) {
    localStorage.setItem("usuarios", JSON.stringify(DATOS_INICIALES.usuarios));
  }
}

// ─── Funciones de Mercados ────────────────────────────────────────
function getMercados() {
  return JSON.parse(localStorage.getItem("mercados") || "[]");
}

function getMercadoPorId(id) {
  return getMercados().find(m => m.id === id);
}

function guardarMercado(mercado) {
  const mercados = getMercados();
  const idx = mercados.findIndex(m => m.id === mercado.id);
  if (idx >= 0) mercados[idx] = mercado;
  else mercados.push(mercado);
  localStorage.setItem("mercados", JSON.stringify(mercados));
}

// ─── Funciones de Productos ───────────────────────────────────────
function getProductos() {
  return JSON.parse(localStorage.getItem("productos") || "[]");
}

function getProductosPorMercado(mercadoId) {
  return getProductos().filter(p => p.mercadoId === mercadoId);
}

function buscarProductos(texto, categoria, mercadoId) {
  let productos = getProductos();
  if (texto) {
    const t = texto.toLowerCase();
    productos = productos.filter(p => p.nombre.toLowerCase().includes(t));
  }
  if (categoria) {
    productos = productos.filter(p => p.categoria === categoria);
  }
  if (mercadoId) {
    productos = productos.filter(p => p.mercadoId === mercadoId);
  }
  return productos;
}

function guardarProducto(producto) {
  const productos = getProductos();
  if (!producto.id) {
    producto.id = "p" + Date.now();
    productos.push(producto);
  } else {
    const idx = productos.findIndex(p => p.id === producto.id);
    if (idx >= 0) productos[idx] = producto;
  }
  localStorage.setItem("productos", JSON.stringify(productos));
  return producto;
}

function eliminarProducto(id) {
  const productos = getProductos().filter(p => p.id !== id);
  localStorage.setItem("productos", JSON.stringify(productos));
}

// ─── Funciones de Usuarios/Sesión ────────────────────────────────
function getUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios") || "[]");
}

function registrarUsuario(datos) {
  const usuarios = getUsuarios();

  // Verificar que el email no esté usado
  if (usuarios.find(u => u.email === datos.email)) {
    return { ok: false, error: "Este correo ya está registrado." };
  }
  // Verificar nombre de mercado único
  const mercados = getMercados();
  if (mercados.find(m => m.nombre.toLowerCase() === datos.nombreMercado.toLowerCase())) {
    return { ok: false, error: "Ya existe un mercado con ese nombre." };
  }

  // Crear mercado
  const mercadoId = "m" + Date.now();
  const mercado = {
    id: mercadoId,
    nombre: datos.nombreMercado,
    direccion: datos.direccion,
    activo: true
  };
  guardarMercado(mercado);

  // Crear usuario (contraseña simple para ejemplo — en producción usarías hash)
  const contrasena = generarContrasena();
  const usuario = {
    id: "u" + Date.now(),
    nombre: datos.nombre,
    email: datos.email,
    contrasena: contrasena,
    mercadoId: mercadoId
  };
  usuarios.push(usuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  return { ok: true, contrasena, usuario };
}

function iniciarSesion(email, contrasena) {
  const usuario = getUsuarios().find(u => u.email === email && u.contrasena === contrasena);
  if (!usuario) return { ok: false, error: "Email o contraseña incorrectos." };

  localStorage.setItem("sesion", JSON.stringify(usuario));
  return { ok: true, usuario };
}

function cerrarSesion() {
  localStorage.removeItem("sesion");
  window.location.href = "index.html";
}

function getSesion() {
  const s = localStorage.getItem("sesion");
  return s ? JSON.parse(s) : null;
}

function requiereLogin() {
  if (!getSesion()) {
    window.location.href = "login.html";
  }
}

// ─── Utilidades ───────────────────────────────────────────────────
function generarContrasena() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let resultado = "";
  for (let i = 0; i < 10; i++) {
    resultado += chars[Math.floor(Math.random() * chars.length)];
  }
  return resultado;
}

function formatearPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO");
}

function mostrarAlerta(mensaje, tipo = "exito") {
  // Eliminar alerta anterior si existe
  const anterior = document.getElementById("alerta-global");
  if (anterior) anterior.remove();

  const colores = {
    exito: "background:#d1fae5; color:#065f46; border-color:#6ee7b7",
    error: "background:#fee2e2; color:#991b1b; border-color:#fca5a5",
    info:  "background:#dbeafe; color:#1e40af; border-color:#93c5fd"
  };

  const div = document.createElement("div");
  div.id = "alerta-global";
  div.style.cssText = `
    position:fixed; top:20px; right:20px; z-index:9999;
    padding:12px 20px; border-radius:10px; border:1px solid;
    font-size:14px; font-weight:500; max-width:320px;
    box-shadow:0 4px 12px rgba(0,0,0,0.1);
    ${colores[tipo]}
  `;
  div.textContent = mensaje;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// Inicializar al cargar cualquier página
inicializar();
