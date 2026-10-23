"use client";

import { useState, useEffect } from "react";
import { Flame, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";

interface Candidate {
  god: string;
  score: number;
  cabin: number;
}

export default function Home() {
  const [stage, setStage] = useState<"form" | "test" | "choice" | "preview_done">("form");
  const [profile, setProfile] = useState({ circe: "", nombre: "", apellido: "", email: "" });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const [questions, setQuestions] = useState<Record<string, Record<string, any>>>({});
  const [godsList, setGodsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hermesTieRule, setHermesTieRule] = useState(false);
  const [selectedGod, setSelectedGod] = useState<string>("");
  const [selectedCabin, setSelectedCabin] = useState<number>(11);
  const [useManual, setUseManual] = useState(false);
  const [manualGod, setManualGod] = useState<string>("");

  // 1. Obtener preguntas al cargar la pantalla
  useEffect(() => {
    fetch("http://localhost:8000/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || {});
        setGodsList(data.gods || []);
        if (data.gods?.length > 0) setManualGod(data.gods[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al conectar con el servidor:", err);
        setLoading(false);
      });
  }, []);

  const questionKeys = Object.keys(questions);
  const currentQuestion = questionKeys[step];
  const currentQuestionData = questions[currentQuestion] || {};
  const currentOptions = currentQuestion ? Object.keys(currentQuestionData) : [];

  // Detectar si la pregunta actual contiene imágenes
  const hasImages = currentOptions.some((opt) => currentQuestionData[opt]?.image);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!profile.circe.trim()) errors.push("Ingresá tu número de Circe.");
    else if (!/^\d+$/.test(profile.circe.trim())) errors.push("El número de Circe debe ser numérico.");
    if (!profile.nombre.trim()) errors.push("Ingresá tu nombre.");
    if (!profile.apellido.trim()) errors.push("Ingresá tu apellido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) errors.push("Ingresá un correo electrónico válido.");

    if (errors.length > 0) setFormErrors(errors);
    else {
      setFormErrors([]);
      setStage("test");
    }
  };

  // 2. Enviar las respuestas elegidas para procesar el test
  const procesarTest = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      
      setCandidates(data.candidates);
      setHermesTieRule(data.hermes_tie_rule);
      
      if (data.candidates.length > 0) {
        setSelectedGod(data.candidates[0].god);
        setSelectedCabin(data.candidates[0].cabin);
      }
      setStage("choice");
    } catch (error) {
      console.error("Error al procesar el test:", error);
    }
  };

  const handleManualGodChange = async (god: string) => {
    setManualGod(god);
    try {
      const res = await fetch(`http://localhost:8000/api/cabin/${god}`);
      const data = await res.json();
      setSelectedGod(god);
      setSelectedCabin(data.cabin);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#2C1A14", color: "#E8DAA0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif" }}>
        <p>⚡ Consultando al Oráculo...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#2C1A14", color: "#E8DAA0", padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <span style={{ color: "#D1B280", fontFamily: "serif", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", border: "1px solid #7A5230", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#1A0F0B" }}>
          Demigods ARG · Filiación Divina
        </span>
        <h1 style={{ fontFamily: "serif", fontSize: "36px", color: "#E06D1A", fontWeight: "bold", marginTop: "12px" }}>
          INSCRIPCIÓN DE CAMPISTAS
        </h1>
      </div>

      <div style={{ maxWidth: hasImages ? "780px" : "580px", width: "100%", backgroundColor: "#E2D4B7", color: "#2C1A14", borderRadius: "10px", border: "8px solid #1D110D", padding: "32px 24px", boxShadow: "0 20px 40px rgba(0,0,0,0.85)", transition: "max-width 0.3s ease" }}>

        {/* 1. FORMULARIO CIRCE */}
        {stage === "form" && (
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "serif", fontSize: "22px", fontWeight: "bold", borderBottom: "2px solid #C4B18F", paddingBottom: "10px", margin: 0 }}>
              Identificación del Campista
            </h2>

            {formErrors.map((err, idx) => (
              <div key={idx} style={{ backgroundColor: "#8B0000", color: "#FFF", padding: "8px 12px", borderRadius: "4px", fontSize: "13px" }}>
                ⚠️ {err}
              </div>
            ))}

            <div>
              <label style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "serif", display: "block", marginBottom: "4px" }}>Número de Circe</label>
              <input
                type="text"
                placeholder="Ej.: 1042"
                value={profile.circe}
                onChange={(e) => setProfile({ ...profile, circe: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "2px solid #7A5230", backgroundColor: "#FFF", color: "#2C1A14", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "serif", display: "block", marginBottom: "4px" }}>Nombre</label>
              <input
                type="text"
                value={profile.nombre}
                onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "2px solid #7A5230", backgroundColor: "#FFF", color: "#2C1A14", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "serif", display: "block", marginBottom: "4px" }}>Apellido</label>
              <input
                type="text"
                value={profile.apellido}
                onChange={(e) => setProfile({ ...profile, apellido: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "2px solid #7A5230", backgroundColor: "#FFF", color: "#2C1A14", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "serif", display: "block", marginBottom: "4px" }}>Correo electrónico</label>
              <input
                type="email"
                placeholder="nombre@ejemplo.com"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "2px solid #7A5230", backgroundColor: "#FFF", color: "#2C1A14", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: "#E06D1A", color: "#FFF", border: "none", padding: "12px", borderRadius: "6px", fontFamily: "serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginTop: "12px" }}
            >
              Continuar al Test →
            </button>
          </form>
        )}

        {/* 2. PREGUNTAS DEL TEST (TEXTO O TARJETAS CON IMÁGENES) */}
        {stage === "test" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #C4B18F", paddingBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "serif" }}>
                Campista: {profile.nombre} · Circe: {profile.circe}
              </span>
              <span style={{ fontSize: "12px", color: "#B8520A", fontWeight: "bold" }}>
                Pregunta {step + 1} de {questionKeys.length}
              </span>
            </div>

            <div style={{ width: "100%", height: "8px", backgroundColor: "#C4B18F", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${((step + 1) / questionKeys.length) * 100}%`, height: "100%", backgroundColor: "#E06D1A", transition: "width 0.3s" }} />
            </div>

            <h2 style={{ fontFamily: "serif", fontSize: "20px", fontWeight: "bold", margin: 0, color: "#2C1A14" }}>
              {currentQuestion}
            </h2>

            {/* Opciones con o sin imágenes */}
            <div 
              style={
                hasImages 
                  ? { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px" }
                  : { display: "flex", flexDirection: "column", gap: "10px" }
              }
            >
              {currentOptions.map((opcion, idx) => {
                const isSelected = answers[currentQuestion] === opcion;
                const imageUrl = currentQuestionData[opcion]?.image;

                if (hasImages && imageUrl) {
                  return (
                    <div
                      key={idx}
                      onClick={() => setAnswers({ ...answers, [currentQuestion]: opcion })}
                      style={{
                        backgroundColor: isSelected ? "#2C1A14" : "rgba(255,255,255,0.75)",
                        color: isSelected ? "#E8DAA0" : "#2C1A14",
                        border: isSelected ? "3px solid #E06D1A" : "2px solid #7A5230",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        boxShadow: isSelected ? "0 4px 12px rgba(224,109,26,0.35)" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ width: "100%", height: "130px", overflow: "hidden", backgroundColor: "#1D110D" }}>
                        <img 
                          src={imageUrl} 
                          alt={opcion} 
                          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isSelected ? 0.95 : 0.8 }} 
                        />
                      </div>
                      <div style={{ padding: "10px", textAlign: "center", fontFamily: "serif", fontWeight: "bold", fontSize: "14px" }}>
                        {isSelected ? "⚡ " : ""}{opcion}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQuestion]: opcion })}
                    style={{
                      backgroundColor: isSelected ? "#2C1A14" : "rgba(255,255,255,0.6)",
                      color: isSelected ? "#E8DAA0" : "#2C1A14",
                      border: "2px solid #7A5230",
                      padding: "12px 16px",
                      borderRadius: "6px",
                      textAlign: "left",
                      fontFamily: "serif",
                      fontWeight: isSelected ? "bold" : "normal",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    {isSelected ? "⚡ " : "• "}{opcion}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                style={{ opacity: step === 0 ? 0.4 : 1, backgroundColor: "#2C1A14", color: "#E8DAA0", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontFamily: "serif", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowLeft style={{ width: "16px", height: "16px" }} /> Anterior
              </button>

              <button
                disabled={!answers[currentQuestion]}
                onClick={() => {
                  if (step === questionKeys.length - 1) {
                    procesarTest();
                  } else {
                    setStep(step + 1);
                  }
                }}
                style={{ opacity: !answers[currentQuestion] ? 0.4 : 1, backgroundColor: "#E06D1A", color: "#FFF", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontFamily: "serif", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {step === questionKeys.length - 1 ? "Ver Resultados" : "Siguiente"} <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
        )}

        {/* 3. RESULTADO DEL TEST */}
        {stage === "choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontFamily: "serif", fontSize: "22px", fontWeight: "bold", borderBottom: "2px solid #C4B18F", paddingBottom: "10px", margin: 0 }}>
              Elegí tu Filiación Divina
            </h2>

            {hermesTieRule && (
              <div style={{ backgroundColor: "#FFF3CD", border: "1px solid #FFEBAA", color: "#856404", padding: "10px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle style={{ width: "18px", height: "18px" }} /> Hubo un empate múltiple: se aplicó la regla de Hermes.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {candidates.map((c) => (
                <button
                  key={c.god}
                  onClick={() => {
                    setUseManual(false);
                    setSelectedGod(c.god);
                    setSelectedCabin(c.cabin);
                  }}
                  style={{
                    backgroundColor: !useManual && selectedGod === c.god ? "#2C1A14" : "rgba(255,255,255,0.6)",
                    color: !useManual && selectedGod === c.god ? "#E8DAA0" : "#2C1A14",
                    border: "2px solid #7A5230",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    textAlign: "left",
                    fontFamily: "serif",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  🏛️ {c.god} (Cabaña {c.cabin})
                </button>
              ))}

              <button
                onClick={() => setUseManual(true)}
                style={{
                  backgroundColor: useManual ? "#2C1A14" : "rgba(255,255,255,0.6)",
                  color: useManual ? "#E8DAA0" : "#2C1A14",
                  border: "2px solid #7A5230",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  textAlign: "left",
                  fontFamily: "serif",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ⚙️ Elegir otra deidad como padre/madre
              </button>

              {useManual && (
                <select
                  value={manualGod}
                  onChange={(e) => handleManualGodChange(e.target.value)}
                  style={{ padding: "10px", borderRadius: "6px", border: "2px solid #7A5230", backgroundColor: "#FFF", color: "#2C1A14", fontFamily: "serif" }}
                >
                  {godsList.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ backgroundColor: "rgba(44,26,20,0.06)", border: "2px solid #C4B18F", padding: "16px", borderRadius: "6px", fontSize: "14px" }}>
              <p style={{ margin: 0 }}><strong>Campista:</strong> {profile.nombre} {profile.apellido}</p>
              <p style={{ margin: "4px 0 0 0" }}><strong>Circe:</strong> {profile.circe}</p>
              <p style={{ margin: "4px 0 0 0", color: "#E06D1A", fontWeight: "bold" }}><strong>Cabaña Asignada:</strong> Cabaña Nº {selectedCabin} ({selectedGod})</p>
            </div>

            <button
              onClick={() => setStage("preview_done")}
              style={{ backgroundColor: "#E06D1A", color: "#FFF", border: "none", padding: "12px", borderRadius: "6px", fontFamily: "serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            >
              Confirmar Inscripción
            </button>
          </div>
        )}

        {/* 4. CONFIRMACIÓN FINAL */}
        {stage === "preview_done" && (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <Flame style={{ width: "56px", height: "56px", color: "#E06D1A" }} />
            <h2 style={{ fontFamily: "serif", fontSize: "28px", margin: 0, color: "#2C1A14" }}>
              ¡Bienvenido/a, {profile.nombre}!
            </h2>
            <p style={{ fontFamily: "serif", fontSize: "18px", color: "#B8520A", fontWeight: "bold", margin: 0 }}>
              Hijo/a de {selectedGod} · Cabaña Nº {selectedCabin}
            </p>

            <button
              onClick={() => {
                setStage("form");
                setStep(0);
                setAnswers({});
                setProfile({ circe: "", nombre: "", apellido: "", email: "" });
              }}
              style={{ backgroundColor: "#2C1A14", color: "#E8DAA0", border: "none", padding: "10px 20px", borderRadius: "6px", fontFamily: "serif", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}
            >
              <RefreshCw style={{ width: "16px", height: "16px" }} /> Nueva Inscripción
            </button>
          </div>
        )}

      </div>
    </div>
  );
}