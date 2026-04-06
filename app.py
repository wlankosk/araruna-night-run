from flask import Flask, render_template, request, redirect, url_for, Response, session
import csv
import io
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from db import init_db, get_db
from config import SECRET_KEY

app = Flask(__name__)
app.secret_key = SECRET_KEY

# =========================
# CONFIG LOGIN (FIXO)
# =========================
ADMIN_USER = "ArarunaNR2026"
ADMIN_PASSWORD_HASH = generate_password_hash("ANR@2026")

# =========================
# LOGIN REQUIRED
# =========================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("admin_logado"):
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated_function

# =========================
# FORMULÁRIO
# =========================
@app.route("/")
def index():
    return render_template("form.html")

@app.route("/submit", methods=["POST"])
def submit():
    nome = request.form.get("nome", "").strip().title()
    idade = request.form.get("idade", "").strip()
    telefone = request.form.get("telefone", "").strip()
    email = request.form.get("email", "").strip()
    categoria = request.form.get("categoria", "").strip()

    if not nome or not idade or not telefone:
        return render_template("form.html", erro="Nome, idade e telefone são obrigatórios!")

    telefone_clean = telefone.replace("(","").replace(")","").replace("-","").replace(" ","")

    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT id FROM inscricoes WHERE telefone = ?", (telefone_clean,))
    if c.fetchone():
        conn.close()
        return render_template("form.html", erro="Este telefone já está cadastrado!")

    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    c.execute("""INSERT INTO inscricoes (datahora, nome, idade, telefone, email, categoria, origem)
                 VALUES (?, ?, ?, ?, ?, ?, ?)""",
              (now, nome, int(idade), telefone_clean, email, categoria, "formulario"))

    conn.commit()
    conn.close()

    return render_template("form.html", sucesso="Inscrição realizada com sucesso!")

# =========================
# LOGIN
# =========================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    erro = None

    if request.method == "POST":
        usuario = request.form.get("usuario")
        senha = request.form.get("senha")

        if usuario == ADMIN_USER and check_password_hash(ADMIN_PASSWORD_HASH, senha):
            session["admin_logado"] = True
            return redirect(url_for("admin"))
        else:
            erro = "Usuário ou senha inválidos"

    return render_template("login.html", erro=erro)

# =========================
# LOGOUT
# =========================
@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))

# =========================
# ADMIN
# =========================
@app.route("/admin")
@login_required
def admin():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM inscricoes")
    total = c.fetchone()[0]

    c.execute("SELECT origem, COUNT(*) FROM inscricoes GROUP BY origem")
    por_origem = dict(c.fetchall())

    c.execute("""
        SELECT id, nome, idade, telefone, email, categoria, datahora, origem
        FROM inscricoes ORDER BY id DESC LIMIT 100
    """)
    registros = c.fetchall()

    c.execute("""
        SELECT
            CASE WHEN idade < 18 THEN 'Menor de 18'
                 WHEN idade < 30 THEN '18-29'
                 WHEN idade < 40 THEN '30-39'
                 WHEN idade < 50 THEN '40-49'
                 WHEN idade < 60 THEN '50-59'
                 ELSE '60+'
            END AS faixa, COUNT(*) AS cnt
        FROM inscricoes GROUP BY faixa ORDER BY faixa
    """)
    faixas = dict(c.fetchall())

    conn.close()

    return render_template("admin.html",
                           total=total,
                           por_origem=por_origem,
                           registros=registros,
                           faixas=faixas)

# =========================
# EXPORTAR
# =========================
@app.route("/admin/exportar")
@login_required
def exportar():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT * FROM inscricoes")
    rows = c.fetchall()
    conn.close()

    si = io.StringIO()
    writer = csv.writer(si)

    writer.writerow(["ID", "Nome", "Idade", "Telefone", "Email", "Categoria", "Data/Hora", "Origem"])

    for row in rows:
        writer.writerow(list(row))

    output = io.BytesIO()
    output.write(si.getvalue().encode("utf-8-sig"))
    output.seek(0)

    return Response(output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=inscricoes.csv"})

# =========================
# START
# =========================
if __name__ == "__main__":
    init_db()
    print("Servidor rodando em http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)