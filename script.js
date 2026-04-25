// ─── CONFIGURACIÓN ───────────────────────────────────────────────
const API_URL = "https://backend-calculo-iva.onrender.com/calcularValorFinal/";

// ─── VALIDACIONES ────────────────────────────────────────────────
function validarCodigo(v) {
  return /^[a-zA-Z0-9]+$/.test(v.trim());
}

function validarNombre(v) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v.trim()) && v.trim().length > 0;
}

function validarNumerico(v) {
  return v !== "" && !isNaN(Number(v)) && Number(v) >= 0;
}

function mostrarError(campo, msg) {
  const el = document.getElementById("error-" + campo);
  const input = document.getElementById(campo);
  if (el) el.textContent = msg;
  if (input) input.classList.add("error");
}

function limpiarError(campo) {
  const el = document.getElementById("error-" + campo);
  const input = document.getElementById(campo);
  if (el) el.textContent = "";
  if (input) input.classList.remove("error");
}

function limpiarErrores() {
  ["codigo", "nombre", "costoBase", "iva", "descuento"].forEach(limpiarError);
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────
async function calcular() {
  limpiarErrores();

  const codigo = document.getElementById("codigo").value;
  const nombre = document.getElementById("nombre").value;
  const costoBase = document.getElementById("costoBase").value;
  const iva = document.getElementById("iva").value;
  const descuento = document.getElementById("descuento").value;

  // Validaciones
  let hayError = false;

  if (!codigo.trim()) {
    mostrarError("codigo", "El código es requerido");
    hayError = true;
  } else if (!validarCodigo(codigo)) {
    mostrarError("codigo", "Solo letras y números permitidos");
    hayError = true;
  }

  if (!nombre.trim()) {
    mostrarError("nombre", "El nombre es requerido");
    hayError = true;
  } else if (!validarNombre(nombre)) {
    mostrarError("nombre", "Solo se permiten letras y espacios");
    hayError = true;
  }

  if (costoBase === "") {
    mostrarError("costoBase", "El costo base es requerido");
    hayError = true;
  } else if (!validarNumerico(costoBase)) {
    mostrarError("costoBase", "Ingrese un número válido mayor o igual a 0");
    hayError = true;
  }

  if (iva === "") {
    mostrarError("iva", "El IVA es requerido");
    hayError = true;
  } else if (!validarNumerico(iva)) {
    mostrarError("iva", "Ingrese un porcentaje válido");
    hayError = true;
  }

  if (descuento === "") {
    mostrarError("descuento", "El descuento es requerido");
    hayError = true;
  } else if (!validarNumerico(descuento)) {
    mostrarError("descuento", "Ingrese un porcentaje válido");
    hayError = true;
  }

  if (hayError) return;

  // Mostrar loading
  const btn = document.getElementById("btnCalcular");
  btn.classList.add("loading");
  btn.querySelector(".btn-text").textContent = "Calculando...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        costoBase: Number(costoBase),
        iva: Number(iva),
        descuento: Number(descuento),
      }),
    });

    const data = await response.json();
    mostrarResultado(data);
  } catch (err) {
    mostrarResultado(null, err.message);
  } finally {
    btn.classList.remove("loading");
    btn.querySelector(".btn-text").textContent = "Calcular Valor Final";
  }
}

// ─── MOSTRAR RESULTADO ────────────────────────────────────────────
function mostrarResultado(data, errorConexion = null) {
  document.getElementById("resultEmpty").style.display = "none";
  const content = document.getElementById("resultContent");
  content.style.display = "block";

  const statusEl = document.getElementById("resultStatus");
  const tituloEl = document.getElementById("resultTitulo");
  const breakdownEl = document.getElementById("resultBreakdown");
  const totalEl = document.getElementById("resultTotal");
  const jsonEl = document.getElementById("resultJson");

  if (errorConexion) {
    statusEl.className = "result-status err";
    statusEl.textContent = "⚠ Error de Conexión";
    tituloEl.textContent = "No se pudo conectar con el servidor";
    breakdownEl.innerHTML = `<div class="breakdown-row"><span class="label">Detalles</span><span class="value">${errorConexion}</span></div>`;
    totalEl.innerHTML = "";
    jsonEl.textContent = "Sin respuesta del servidor";
    return;
  }

  const es200 = data.codigoHTTP === 200;

  // Status badge
  statusEl.className = "result-status " + (es200 ? "ok" : "err");
  statusEl.textContent = es200 ? "✓ HTTP 200" : "✗ HTTP 404";

  // Título
  tituloEl.textContent = data.Titulo || "";

  // Breakdown
  if (es200) {
    const montoDescuento = (data.valorBase * data.descuento) / 100;
    const precioNeto = data.valorBase - montoDescuento;
    const montoIva = (precioNeto * data.iva) / 100;

    breakdownEl.innerHTML = `
      <div class="breakdown-row">
        <span class="label">Costo Base</span>
        <span class="value">$ ${formatNum(data.valorBase)}</span>
      </div>
      <div class="breakdown-row">
        <span class="label">Descuento (${data.descuento}%)</span>
        <span class="value negative">- $ ${formatNum(montoDescuento)}</span>
      </div>
      <div class="breakdown-row">
        <span class="label">Precio Neto</span>
        <span class="value">$ ${formatNum(precioNeto)}</span>
      </div>
      <div class="breakdown-row">
        <span class="label">IVA (${data.iva}%) sobre precio neto</span>
        <span class="value positive">+ $ ${formatNum(montoIva)}</span>
      </div>
    `;

    totalEl.innerHTML = `
      <div class="total-label">Valor Final a Pagar</div>
      <div class="total-value">$ ${formatNum(data.Valor)}</div>
    `;
  } else {
    breakdownEl.innerHTML = `
      <div class="breakdown-row">
        <span class="label">Estado</span>
        <span class="value">Datos no válidos o no encontrados</span>
      </div>
    `;
    totalEl.innerHTML = `
      <div class="total-label">Valor</div>
      <div class="total-value" style="color:var(--danger)">$ 0</div>
    `;
  }

  // JSON raw
  jsonEl.textContent = JSON.stringify(data, null, 2);
}

function formatNum(num) {
  return Number(num).toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ─── EVENTOS EN TIEMPO REAL ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const reglas = {
    codigo: validarCodigo,
    nombre: validarNombre,
    costoBase: validarNumerico,
    iva: validarNumerico,
    descuento: validarNumerico,
  };

  const mensajes = {
    codigo: "Solo letras y números",
    nombre: "Solo letras y espacios",
    costoBase: "Número válido ≥ 0",
    iva: "Porcentaje válido",
    descuento: "Porcentaje válido",
  };

  Object.keys(reglas).forEach((campo) => {
    const input = document.getElementById(campo);
    if (!input) return;
    input.addEventListener("input", () => {
      if (input.value && !reglas[campo](input.value)) {
        mostrarError(campo, mensajes[campo]);
      } else {
        limpiarError(campo);
      }
    });
  });

  // Enter en cualquier input dispara cálculo
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") calcular();
    });
  });
});
