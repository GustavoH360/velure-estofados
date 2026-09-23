document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ==========================================
        // TEMA CLARO / ESCURO
        // ==========================================

       const themeButton = document.getElementById("themeButton");
const themeText = document.getElementById("themeText");

function updateThemeButton() {
    const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";

    if (themeText) {
        themeText.textContent = isDark
            ? "Claro"
            : "Escuro";
    }
}

const savedTheme =
    localStorage.getItem("velure-theme");

if (savedTheme === "dark") {
    document.documentElement.setAttribute(
        "data-theme",
        "dark"
    );
} else {
    document.documentElement.removeAttribute(
        "data-theme"
    );
}

updateThemeButton();

if (themeButton) {
    themeButton.addEventListener(
        "click",
        function () {

            const isDark =
                document.documentElement
                    .getAttribute("data-theme") === "dark";

            if (isDark) {

                document.documentElement
                    .removeAttribute("data-theme");

                localStorage.setItem(
                    "velure-theme",
                    "light"
                );

            } else {

                document.documentElement
                    .setAttribute(
                        "data-theme",
                        "dark"
                    );

                localStorage.setItem(
                    "velure-theme",
                    "dark"
                );
            }

            updateThemeButton();
        }
    );
}


        // ==========================================
        // CARRINHO
        // ==========================================

        const cartButton =
            document.getElementById(
                "cartButton"
            );

        const cartDrawer =
            document.getElementById(
                "cartDrawer"
            );

        const cartOverlay =
            document.getElementById(
                "cartOverlay"
            );

        const closeCart =
            document.getElementById(
                "closeCart"
            );

        const cartItems =
            document.getElementById(
                "cartItems"
            );

        const cartTotal =
            document.getElementById(
                "cartTotal"
            );

        const cartCount =
            document.getElementById(
                "cartCount"
            );


        let cart = [];


        try {

            const savedCart =
                localStorage.getItem(
                    "velure-cart"
                );


            if (savedCart) {

                const parsedCart =
                    JSON.parse(
                        savedCart
                    );


                if (Array.isArray(parsedCart)) {

                    cart =
                        parsedCart.map(
                            function (item) {

                                return {
                                    id:
                                        Number(
                                            item.id
                                        ),

                                    name:
                                        item.name || "",

                                    price:
                                        Number(
                                            item.price
                                        ) || 0,

                                    image:
                                        item.image || "",

                                    quantity:
                                        Math.max(
                                            1,
                                            Number(
                                                item.quantity
                                            ) || 1
                                        )
                                };
                            }
                        );
                }
            }

        } catch (error) {

            console.error(
                "Erro ao carregar carrinho:",
                error
            );

            cart = [];
        }



        function saveCart() {

            localStorage.setItem(
                "velure-cart",
                JSON.stringify(
                    cart
                )
            );
        }



        function formatCurrency(
            value
        ) {

            return Number(
                value || 0
            ).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );
        }



        function openCartDrawer() {

            if (cartDrawer) {

                cartDrawer.classList.add(
                    "active"
                );
            }


            if (cartOverlay) {

                cartOverlay.classList.add(
                    "active"
                );
            }


            document.body.style.overflow =
                "hidden";
        }



        function closeCartDrawer() {

            if (cartDrawer) {

                cartDrawer.classList.remove(
                    "active"
                );
            }


            if (cartOverlay) {

                cartOverlay.classList.remove(
                    "active"
                );
            }


            document.body.style.overflow =
                "";
        }



        function updateCart() {

            saveCart();


            const totalQuantidade =
                cart.reduce(
                    function (
                        total,
                        item
                    ) {

                        return (
                            total +
                            item.quantity
                        );
                    },
                    0
                );


            if (cartCount) {

                cartCount.textContent =
                    totalQuantidade;
            }


            const totalPreco =
                cart.reduce(
                    function (
                        total,
                        item
                    ) {

                        return (
                            total +
                            (
                                item.price *
                                item.quantity
                            )
                        );
                    },
                    0
                );


            if (cartTotal) {

                cartTotal.textContent =
                    formatCurrency(
                        totalPreco
                    );
            }


            if (!cartItems) {

                return;
            }


            if (cart.length === 0) {

                cartItems.innerHTML = `
                    <div class="empty-cart">
                        Seu carrinho está vazio.
                    </div>
                `;

                return;
            }


            cartItems.innerHTML =
                cart.map(
                    function (item) {

                        const imagem =
                            item.image
                                ? `
                                    <img
                                        src="${item.image}"
                                        alt="${item.name}">
                                  `
                                : `
                                    <div class="cart-item-no-image">
                                        <i class="fa-solid fa-image"></i>
                                    </div>
                                  `;


                        return `
                            <div
                                class="cart-item"
                                data-cart-id="${item.id}">

                                <div class="cart-item-image">

                                    ${imagem}

                                </div>


                                <div class="cart-item-content">

                                    <strong class="cart-item-name">

                                        ${item.name}

                                    </strong>


                                    <span class="cart-item-price">

                                        ${formatCurrency(
                                            item.price
                                        )}

                                    </span>


                                    <div class="cart-item-actions">

                                        <div class="cart-quantity">

                                            <button
                                                type="button"
                                                data-cart-action="decrease">

                                                <i class="fa-solid fa-minus"></i>

                                            </button>


                                            <span>

                                                ${item.quantity}

                                            </span>


                                            <button
                                                type="button"
                                                data-cart-action="increase">

                                                <i class="fa-solid fa-plus"></i>

                                            </button>

                                        </div>


                                        <button
                                            type="button"
                                            class="cart-remove"
                                            data-cart-action="remove">

                                            <i class="fa-solid fa-trash"></i>

                                        </button>

                                    </div>

                                </div>

                            </div>
                        `;
                    }
                )
                .join("");
        }



        if (cartButton) {

            cartButton.addEventListener(
                "click",
                openCartDrawer
            );
        }


        if (closeCart) {

            closeCart.addEventListener(
                "click",
                closeCartDrawer
            );
        }


        if (cartOverlay) {

            cartOverlay.addEventListener(
                "click",
                closeCartDrawer
            );
        }



        // ==========================================
        // ADICIONAR PRODUTO AO CARRINHO
        // ==========================================

        document.addEventListener(
            "click",
          function (event) {

                const button =
                    event.target.closest(
                        ".add-cart-button"
                    );


                if (!button) {

                    return;
                }


                const id =
                    Number(
                        button.dataset.id
                    );


                const name =
                    button.dataset.name ||
                    "Produto";


                const price =
                    Number(
                        button.dataset.price
                    );


                const image =
                    button.dataset.image ||
                    "";

                    const stock =
    Number(
        button.dataset.stock
    );

                if (
                    !Number.isFinite(id) ||
                    id <= 0
                ) {

                    alert(
                        "Produto inválido."
                    );

                    return;
                }


                if (
                    !Number.isFinite(price) ||
                    price < 0
                ) {

                    alert(
                        "Preço do produto inválido."
                    );

                    return;
                }


                const existingItem =
                    cart.find(
                        function (item) {

                            return (
                                item.id === id
                            );
                        }
                    );


                if (
    !Number.isFinite(stock) ||
    stock <= 0
) {
    alert(
        "Este produto está esgotado."
    );

    return;
}


if (existingItem) {

    if (existingItem.quantity >= stock) {

        alert(
            `Só existem ${stock} unidade(s) disponíveis deste produto.`
        );

        openCartDrawer();

        return;
    }

    existingItem.quantity++;

    existingItem.stock = stock;

} else {

    cart.push({
        id: id,
        name: name,
        price: price,
        image: image,
        quantity: 1,
        stock: stock
    });

}


updateCart();

openCartDrawer();
            }
        );



        // ==========================================
        // ALTERAR QUANTIDADE / REMOVER
        // ==========================================

        if (cartItems) {

            cartItems.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-cart-action]"
                        );


                    if (!button) {

                        return;
                    }


                    const cartItem =
                        button.closest(
                            "[data-cart-id]"
                        );


                    if (!cartItem) {

                        return;
                    }


                    const id =
                        Number(
                            cartItem.dataset.cartId
                        );

const action =
    button.dataset.cartAction;

                    const item =
                        cart.find(
                            function (produto) {

                                return (
                                    produto.id === id
                                );
                            }
                        );


                    if (!item) {

                        return;
                    }


if (
    action ===
    "increase"
) {

    const stock =
        Number(item.stock);

    if (
        Number.isFinite(stock) &&
        stock > 0 &&
        item.quantity >= stock
    ) {

        alert(
            `Só existem ${stock} unidade(s) disponíveis deste produto.`
        );

        return;
    }

    item.quantity++;
}


                    if (
                        action ===
                        "decrease"
                    ) {

                        item.quantity--;


                        if (
                            item.quantity <= 0
                        ) {

                            cart =
                                cart.filter(
                                    function (
                                        produto
                                    ) {

                                        return (
                                            produto.id !==
                                            id
                                        );
                                    }
                                );
                        }
                    }


                    if (
                        action ===
                        "remove"
                    ) {

                        cart =
                            cart.filter(
                                function (
                                    produto
                                ) {

                                    return (
                                        produto.id !==
                                        id
                                    );
                                }
                            );
                    }


                    updateCart();
                }
            );
        }


        updateCart();

                // ==========================================
        // LOGIN / CADASTRO / CONTA
        // ==========================================

        const accountButton =
            document.getElementById(
                "accountButton"
            );

        const accountButtonText =
            document.getElementById(
                "accountButtonText"
            );

        const accountModal =
            document.getElementById(
                "accountModal"
            );

        const accountOverlay =
            document.getElementById(
                "accountOverlay"
            );

        const closeAccount =
            document.getElementById(
                "closeAccount"
            );

        const accountTabs =
            document.querySelectorAll(
                ".account-tab"
            );

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const registerForm =
            document.getElementById(
                "registerForm"
            );

        const accountDropdown =
            document.getElementById(
                "accountDropdown"
            );

        const accountUserName =
            document.getElementById(
                "accountUserName"
            );

        const accountUserEmail =
            document.getElementById(
                "accountUserEmail"
            );

        const adminPanelButton =
            document.getElementById(
                "adminPanelButton"
            );

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );



        function openAccountModal() {

            if (accountModal) {

                accountModal.classList.add(
                    "active"
                );
            }


            if (accountOverlay) {

                accountOverlay.classList.add(
                    "active"
                );
            }


            document.body.style.overflow =
                "hidden";
        }



        function closeAccountModal() {

            if (accountModal) {

                accountModal.classList.remove(
                    "active"
                );
            }


            if (accountOverlay) {

                accountOverlay.classList.remove(
                    "active"
                );
            }


            document.body.style.overflow =
                "";
        }



        function closeAccountDropdown() {

            if (accountDropdown) {

                accountDropdown.classList.remove(
                    "active"
                );
            }
        }



        function updateLoggedUser(
            nome,
            email = "",
            role = ""
        ) {

            if (!accountButton) {

                return;
            }


            accountButton.dataset.logged =
                "true";


            const primeiroNome =
                nome
                    ? nome.split(" ")[0]
                    : "Conta";


            if (accountButtonText) {

                accountButtonText.textContent =
                    primeiroNome;

            } else {

                accountButton.innerHTML = `
                    <i class="fa-solid fa-user-check"></i>
                    <span>${primeiroNome}</span>
                `;
            }


            if (accountUserName) {

                accountUserName.textContent =
                    nome || "Cliente";
            }


            if (accountUserEmail) {

                accountUserEmail.textContent =
                    email || "";
            }


            // ======================================
            // ADMIN
            // ======================================

            if (adminPanelButton) {

                adminPanelButton.style.display =
                    role === "Admin"
                        ? "flex"
                        : "none";
            }
        }



        function resetLoggedUser() {

            if (accountButton) {

                accountButton.dataset.logged =
                    "false";
            }


            if (accountButtonText) {

                accountButtonText.textContent =
                    "Entrar";

            } else if (accountButton) {

                accountButton.innerHTML = `
                    <i class="fa-solid fa-user"></i>
                    <span>Entrar</span>
                `;
            }


            if (accountUserName) {

                accountUserName.textContent =
                    "Cliente";
            }


            if (accountUserEmail) {

                accountUserEmail.textContent =
                    "";
            }


            if (adminPanelButton) {

                adminPanelButton.style.display =
                    "none";
            }


            closeAccountDropdown();
        }



        if (accountButton) {

            accountButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const estaLogado =
                        accountButton
                            .dataset
                            .logged === "true";


                    if (!estaLogado) {

                        openAccountModal();

                        return;
                    }


                    if (accountDropdown) {

                        accountDropdown
                            .classList
                            .toggle(
                                "active"
                            );
                    }
                }
            );
        }



        if (accountDropdown) {

            accountDropdown.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();
                }
            );
        }



        document.addEventListener(
            "click",
            function () {

                closeAccountDropdown();
            }
        );



        if (closeAccount) {

            closeAccount.addEventListener(
                "click",
                closeAccountModal
            );
        }


        if (accountOverlay) {

            accountOverlay.addEventListener(
                "click",
                closeAccountModal
            );
        }



        // ==========================================
        // ABAS LOGIN / CADASTRO
        // ==========================================

        accountTabs.forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        accountTabs.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );
                            }
                        );


                        this.classList.add(
                            "active"
                        );


                        if (
                            this.dataset.tab ===
                            "login"
                        ) {

                            if (loginForm) {

                                loginForm.classList.add(
                                    "active"
                                );
                            }


                            if (registerForm) {

                                registerForm.classList.remove(
                                    "active"
                                );
                            }

                        } else {

                            if (registerForm) {

                                registerForm.classList.add(
                                    "active"
                                );
                            }


                            if (loginForm) {

                                loginForm.classList.remove(
                                    "active"
                                );
                            }
                        }
                    }
                );
            }
        );



        // ==========================================
        // CADASTRO
        // ==========================================

        const registerButton =
            document.getElementById(
                "registerButton"
            );

        const registerName =
            document.getElementById(
                "registerName"
            );

        const registerEmail =
            document.getElementById(
                "registerEmail"
            );

        const registerPassword =
            document.getElementById(
                "registerPassword"
            );

        const registerConfirmPassword =
            document.getElementById(
                "registerConfirmPassword"
            );



        if (registerButton) {

            registerButton.addEventListener(
                "click",
                async function () {

                    const nome =
                        registerName
                            ? registerName
                                .value
                                .trim()
                            : "";


                    const email =
                        registerEmail
                            ? registerEmail
                                .value
                                .trim()
                            : "";


                    const senha =
                        registerPassword
                            ? registerPassword
                                .value
                            : "";


                    const confirmarSenha =
                        registerConfirmPassword
                            ? registerConfirmPassword
                                .value
                            : "";


                    if (
                        !nome ||
                        !email ||
                        !senha ||
                        !confirmarSenha
                    ) {

                        alert(
                            "Preencha todos os campos."
                        );

                        return;
                    }

                    const emailValido =   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

if (!emailValido) {

    alert(
        "Digite um endereço de e-mail válido."
    );

    registerEmail?.focus();

    return;
}

                    if (
                        senha !==
                        confirmarSenha
                    ) {

                        alert(
                            "As senhas não coincidem."
                        );

                        return;
                    }


                    if (
                        senha.length < 6
                    ) {

                        alert(
                            "A senha deve ter pelo menos 6 caracteres."
                        );

                        return;
                    }


                    registerButton.disabled =
                        true;


                    registerButton.textContent =
                        "Criando conta...";


                    try {

                        const response =
                            await fetch(
                                "/api/auth/cadastro",
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            nome:
                                                nome,

                                            email:
                                                email,

                                            senha:
                                                senha
                                        })
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.mensagem ||
                                "Não foi possível criar a conta."
                            );

                            return;
                        }


                        alert(
                            data.mensagem ||
                            "Cadastro realizado com sucesso!"
                        );


                        if (registerName) {

                            registerName.value =
                                "";
                        }


                        if (registerEmail) {

                            registerEmail.value =
                                "";
                        }


                        if (registerPassword) {

                            registerPassword.value =
                                "";
                        }


                        if (
                            registerConfirmPassword
                        ) {

                            registerConfirmPassword.value =
                                "";
                        }


                        accountTabs.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );
                            }
                        );


                        const loginTab =
                            document.querySelector(
                                '.account-tab[data-tab="login"]'
                            );


                        if (loginTab) {

                            loginTab.classList.add(
                                "active"
                            );
                        }


                        if (registerForm) {

                            registerForm.classList.remove(
                                "active"
                            );
                        }


                        if (loginForm) {

                            loginForm.classList.add(
                                "active"
                            );
                        }


                        const loginEmailInput =
                            document.getElementById(
                                "loginEmail"
                            );


                        if (loginEmailInput) {

                            loginEmailInput.value =
                                email;
                        }

                    } catch (error) {

                        console.error(
                            "Erro ao cadastrar cliente:",
                            error
                        );


                        alert(
                            "Erro ao conectar com o servidor."
                        );

                    } finally {

                        registerButton.disabled =
                            false;


                        registerButton.textContent =
                            "Criar conta";
                    }
                }
            );
        }



        // ==========================================
        // LOGIN
        // ==========================================

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        const loginEmail =
            document.getElementById(
                "loginEmail"
            );

        const loginPassword =
            document.getElementById(
                "loginPassword"
            );



        if (loginButton) {

            loginButton.addEventListener(
                "click",
                async function () {

                    const email =
                        loginEmail
                            ? loginEmail
                                .value
                                .trim()
                            : "";


                    const senha =
                        loginPassword
                            ? loginPassword
                                .value
                            : "";


                    if (
                        !email ||
                        !senha
                    ) {

                        alert(
                            "Informe o e-mail e a senha."
                        );

                        return;
                    }


                    loginButton.disabled =
                        true;


                    loginButton.textContent =
                        "Entrando...";


                    try {

                        const response =
                            await fetch(
                                "/api/auth/login",
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            email:
                                                email,

                                            senha:
                                                senha
                                        })
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.mensagem ||
                                "E-mail ou senha incorretos."
                            );

                            return;
                        }


                        if (loginPassword) {

                            loginPassword.value =
                                "";
                        }


                        closeAccountModal();


                        // IMPORTANTE:
                        // busca nome, email e ROLE
                        // diretamente do cookie.

                        await checkLoggedUser();


                        alert(
                            "Bem-vindo, " +
                            data.cliente.nome +
                            "!"
                        );

                    } catch (error) {

                        console.error(
                            "Erro no login:",
                            error
                        );


                        alert(
                            "Erro ao conectar com o servidor."
                        );

                    } finally {

                        loginButton.disabled =
                            false;


                        loginButton.textContent =
                            "Entrar";
                    }
                }
            );
        }



        // ==========================================
        // VERIFICAR LOGIN
        // ==========================================

        async function checkLoggedUser() {

            try {

                const response =
                    await fetch(
                        "/api/auth/me"
                    );


                if (!response.ok) {

                    resetLoggedUser();

                    return;
                }


                const data =
                    await response.json();


                if (
                    data.autenticado &&
                    data.cliente
                ) {

                    updateLoggedUser(
                        data.cliente.nome,
                        data.cliente.email,
                        data.cliente.role
                    );

                } else {

                    resetLoggedUser();
                }

            } catch (error) {

                console.error(
                    "Erro ao verificar usuário:",
                    error
                );
            }
        }



        // ==========================================
        // LOGOUT
        // ==========================================

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async function () {

                    try {

                        const response =
                            await fetch(
                                "/api/auth/logout",
                                {
                                    method:
                                        "POST"
                                }
                            );


                        if (!response.ok) {

                            alert(
                                "Não foi possível sair da conta."
                            );

                            return;
                        }


                        resetLoggedUser();

                        closeAccountModal();


                        alert(
                            "Você saiu da sua conta."
                        );

                    } catch (error) {

                        console.error(
                            "Erro ao sair:",
                            error
                        );


                        alert(
                            "Erro ao conectar com o servidor."
                        );
                    }
                }
            );
        }

                // ==========================================
        // CHECKOUT / FINALIZAR PEDIDO
        // ==========================================
// ==========================================
// MÁSCARAS DO CHECKOUT
// ==========================================

const checkoutTelefone =
    document.getElementById("checkoutTelefone");

const checkoutCpf =
    document.getElementById("checkoutCpf");

const checkoutCep =
    document.getElementById("checkoutCep");

const checkoutEstado =
    document.getElementById("checkoutEstado");


// TELEFONE: (11) 99999-9999
if (checkoutTelefone) {

    checkoutTelefone.addEventListener(
        "input",
        function () {

            let valor =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 11);

            if (valor.length > 10) {

                valor = valor.replace(
                    /^(\d{2})(\d{5})(\d{0,4})/,
                    "($1) $2-$3"
                );

            } else if (valor.length > 6) {

                valor = valor.replace(
                    /^(\d{2})(\d{4})(\d{0,4})/,
                    "($1) $2-$3"
                );

            } else if (valor.length > 2) {

                valor = valor.replace(
                    /^(\d{2})(\d+)/,
                    "($1) $2"
                );

            } else if (valor.length > 0) {

                valor = valor.replace(
                    /^(\d{0,2})/,
                    "($1"
                );
            }

            this.value = valor;
        }
    );
}


// CPF: 000.000.000-00
if (checkoutCpf) {

    checkoutCpf.addEventListener(
        "input",
        function () {

            let valor =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 11);

            valor = valor.replace(
                /(\d{3})(\d)/,
                "$1.$2"
            );

            valor = valor.replace(
                /(\d{3})(\d)/,
                "$1.$2"
            );

            valor = valor.replace(
                /(\d{3})(\d{1,2})$/,
                "$1-$2"
            );

            this.value = valor;
        }
    );
}


// CEP: 00000-000
if (checkoutCep) {

    checkoutCep.addEventListener(
        "input",
        function () {

            let valor =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 8);

            valor = valor.replace(
                /^(\d{5})(\d)/,
                "$1-$2"
            );

            this.value = valor;
        }
    );
}


// ESTADO: somente letras e maiúsculo
if (checkoutEstado) {

    checkoutEstado.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(/[^a-zA-Z]/g, "")
                    .toUpperCase()
                    .slice(0, 2);
        }
    );
} 

        const checkoutButton =
            document.getElementById(
                "checkoutButton"
            );

        const checkoutOverlay =
            document.getElementById(
                "checkoutOverlay"
            );

        const checkoutClose =
            document.getElementById(
                "checkoutClose"
            );

        const checkoutForm =
            document.getElementById(
                "checkoutForm"
            );


        // ==========================================
        // ABRIR CHECKOUT
        // ==========================================

        if (checkoutButton) {

            checkoutButton.addEventListener(
                "click",
                function () {

                    if (
                        !cart ||
                        cart.length === 0
                    ) {

                        alert(
                            "Seu carrinho está vazio."
                        );

                        return;
                    }


                    if (checkoutOverlay) {

                        checkoutOverlay.classList.add(
                            "active"
                        );

                    }

                }
            );

        }


        // ==========================================
        // FECHAR CHECKOUT
        // ==========================================

        if (checkoutClose) {

            checkoutClose.addEventListener(
                "click",
                function () {

                    checkoutOverlay
                        ?.classList
                        .remove("active");

                }
            );

        }


        // clicar fora do modal
        if (checkoutOverlay) {

            checkoutOverlay.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        checkoutOverlay
                    ) {

                        checkoutOverlay
                            .classList
                            .remove("active");

                    }

                }
            );

        }


        // ==========================================
        // ENVIAR CHECKOUT
        // ==========================================

        if (checkoutForm) {

            checkoutForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

// ==========================================
// VALIDAR DADOS DO CHECKOUT
// ==========================================

const telefoneNumeros =
    checkoutTelefone?.value.replace(/\D/g, "") || "";

const cpfNumeros =
    checkoutCpf?.value.replace(/\D/g, "") || "";

const cepNumeros =
    checkoutCep?.value.replace(/\D/g, "") || "";

const estadoValor =
    checkoutEstado?.value.trim().toUpperCase() || "";


// TELEFONE
if (
    telefoneNumeros.length !== 10 &&
    telefoneNumeros.length !== 11
) {
    alert(
        "Digite um telefone válido com DDD."
    );

    checkoutTelefone?.focus();

    return;
}


// CPF
if (
    cpfNumeros.length > 0 &&
    cpfNumeros.length !== 11
) {
    alert(
        "Digite um CPF completo."
    );

    checkoutCpf?.focus();

    return;
}


// CEP
if (cepNumeros.length !== 8) {

    alert(
        "Digite um CEP válido com 8 números."
    );

    checkoutCep?.focus();

    return;
}


// ESTADO
if (!/^[A-Z]{2}$/.test(estadoValor)) {

    alert(
        "Digite a sigla do Estado. Exemplo: SP."
    );

    checkoutEstado?.focus();

    return;
}

                    if (
                        !cart ||
                        cart.length === 0
                    ) {

                        alert(
                            "Seu carrinho está vazio."
                        );

                        return;
                    }


                    const submitButton =
                        checkoutForm.querySelector(
                            ".checkout-submit"
                        );


                    const textoOriginal =
                        submitButton
                            ? submitButton.innerHTML
                            : "";


                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.innerHTML = `
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            Processando pedido...
                        `;

                    }


                    const payload = {

                        telefone:
                            document.getElementById(
                                "checkoutTelefone"
                            )?.value.trim(),

                        cpf:
                            document.getElementById(
                                "checkoutCpf"
                            )?.value.trim(),

                        cep:
                            document.getElementById(
                                "checkoutCep"
                            )?.value.trim(),

                        endereco:
                            document.getElementById(
                                "checkoutEndereco"
                            )?.value.trim(),

                        numero:
                            document.getElementById(
                                "checkoutNumero"
                            )?.value.trim(),

                        complemento:
                            document.getElementById(
                                "checkoutComplemento"
                            )?.value.trim(),

                        bairro:
                            document.getElementById(
                                "checkoutBairro"
                            )?.value.trim(),

                        cidade:
                            document.getElementById(
                                "checkoutCidade"
                            )?.value.trim(),

                        estado:
                            document.getElementById(
                                "checkoutEstado"
                            )?.value
                            .trim()
                            .toUpperCase(),

                        formaPagamento:
                            document.getElementById(
                                "checkoutPagamento"
                            )?.value,

                        itens:
                            cart.map(
                                function (item) {

                                    return {

                                        produtoId:
                                            Number(
                                                item.id
                                            ),

                                        quantidade:
                                            Number(
                                                item.quantity
                                            )
                                    };

                                }
                            )
                    };


                    try {

                        const response =
                            await fetch(
                                "/api/pedidos/finalizar",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            payload
                                        )
                                }
                            );


                        if (
                            response.status === 401
                        ) {

                            alert(
                                "Entre na sua conta para finalizar o pedido."
                            );

                            checkoutOverlay
                                ?.classList
                                .remove(
                                    "active"
                                );

                            closeCartDrawer();

                            openAccountModal();

                            return;
                        }


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.mensagem ||
                                "Não foi possível finalizar o pedido."
                            );

                            return;
                        }


                        // ==================================
                        // PEDIDO REALIZADO
                        // ==================================

                        alert(
                            "Pedido #" +
                            data.pedido.id +
                            " realizado com sucesso!\n\n" +
                            "Total: " +
                            formatCurrency(
                                data.pedido.total
                            )
                        );


                        // limpa o carrinho
                        cart = [];


                        localStorage.setItem(
                            "velure-cart",
                            JSON.stringify(cart)
                        );


                        updateCart();


                        closeCartDrawer();


                        checkoutOverlay
                            ?.classList
                            .remove(
                                "active"
                            );


                        checkoutForm.reset();

                    }
                    catch (error) {

                        console.error(
                            "Erro ao finalizar pedido:",
                            error
                        );


                        alert(
                            "Erro ao conectar com o servidor."
                        );

                    }
                    finally {

                        if (submitButton) {

                            submitButton.disabled =
                                false;

                            submitButton.innerHTML =
                                textoOriginal;

                        }

                    }

                }
            );

        }

        // ==========================================
        // MEUS PEDIDOS
        // ==========================================

const myOrdersButton =
    document.getElementById("myOrdersButton");

const profileOrdersButton =
    document.getElementById("profileOrdersButton");

        const ordersModal =
            document.getElementById(
                "ordersModal"
            );

        const ordersOverlay =
            document.getElementById(
                "ordersOverlay"
            );

        const closeOrders =
            document.getElementById(
                "closeOrders"
            );

        const ordersContent =
            document.getElementById(
                "ordersContent"
            );



        function openOrdersModal() {

            if (ordersModal) {

                ordersModal.classList.add(
                    "active"
                );
            }


            if (ordersOverlay) {

                ordersOverlay.classList.add(
                    "active"
                );
            }
        }



        function closeOrdersModal() {

            if (ordersModal) {

                ordersModal.classList.remove(
                    "active"
                );
            }


            if (ordersOverlay) {

                ordersOverlay.classList.remove(
                    "active"
                );
            }
        }



        async function loadOrders() {

            if (!ordersContent) {

                return;
            }


            ordersContent.innerHTML = `
                <p class="orders-loading">
                    Carregando pedidos...
                </p>
            `;


            try {

                const response =
                    await fetch(
                        "/api/pedidos/meus"
                    );


                if (
                    response.status ===
                    401
                ) {

                    closeOrdersModal();


                    alert(
                        "Entre na sua conta para visualizar seus pedidos."
                    );


                    openAccountModal();

                    return;
                }


                if (!response.ok) {

                    ordersContent.innerHTML = `
                        <p class="orders-empty">
                            Não foi possível carregar os pedidos.
                        </p>
                    `;

                    return;
                }


                const pedidos =
                    await response.json();


                if (
                    !pedidos ||
                    pedidos.length === 0
                ) {

                    ordersContent.innerHTML = `
                        <p class="orders-empty">
                            Você ainda não realizou nenhum pedido.
                        </p>
                    `;

                    return;
                }


                ordersContent.innerHTML =
                    pedidos.map(
                        function (pedido) {

                            const data =
                                new Date(
                                    pedido.criadoEm
                                );


                            const dataFormatada =
                                data.toLocaleString(
                                    "pt-BR"
                                );


                            const itensHtml =
                                pedido.itens
                                    .map(
                                        function (
                                            item
                                        ) {

                                            return `
                                                <div class="order-item">

                                                    <div class="order-item-info">

                                                        <strong>
                                                            ${item.nomeProduto}
                                                        </strong>

                                                        <small>

                                                            ${item.quantidade}
                                                            unidade(s)
                                                            ×
                                                            ${formatCurrency(
                                                                item.precoUnitario
                                                            )}

                                                        </small>

                                                    </div>


                                                    <div class="order-item-price">

                                                        ${formatCurrency(
                                                            item.subtotal
                                                        )}

                                                    </div>

                                                </div>
                                            `;
                                        }
                                    )
                                    .join("");


                            const statusAtual =
    pedido.status || "Pendente";

const etapas = [
    "Pendente",
    "Em preparação",
    "Enviado",
    "Entregue"
];

const indiceAtual =
    etapas.indexOf(statusAtual);

const cancelado =
    statusAtual === "Cancelado";

return `
    <div class="order-card">

        <div class="order-card-header">

            <div>
                <div class="order-number">
                    Pedido #${pedido.id}
                </div>

                <span class="order-date">
                    ${dataFormatada}
                </span>
            </div>

            <span class="order-status
                ${cancelado ? "order-status-cancelled" : ""}">
                ${statusAtual}
            </span>

        </div>


        <div class="order-items">
            ${itensHtml}
        </div>


        ${
            cancelado
            ?
            `
                <div class="order-cancelled-box">

                    <i class="fa-solid fa-circle-xmark"></i>

                    <div>
                        <strong>Pedido cancelado</strong>
                        <span>
                            Este pedido não seguirá para entrega.
                        </span>
                    </div>

                </div>
            `
            :
            `
                <div class="order-tracking">

                    <div class="order-tracking-step
                        ${indiceAtual >= 0 ? "completed" : ""}">

                        <div class="tracking-icon">
                            <i class="fa-solid fa-receipt"></i>
                        </div>

                        <span>
                            Pedido realizado
                        </span>

                    </div>


                    <div class="order-tracking-line
                        ${indiceAtual >= 1 ? "completed" : ""}">
                    </div>


                    <div class="order-tracking-step
                        ${indiceAtual >= 1 ? "completed" : ""}">

                        <div class="tracking-icon">
                            <i class="fa-solid fa-box-open"></i>
                        </div>

                        <span>
                            Em preparação
                        </span>

                    </div>


                    <div class="order-tracking-line
                        ${indiceAtual >= 2 ? "completed" : ""}">
                    </div>


                    <div class="order-tracking-step
                        ${indiceAtual >= 2 ? "completed" : ""}">

                        <div class="tracking-icon">
                            <i class="fa-solid fa-truck"></i>
                        </div>

                        <span>
                            Enviado
                        </span>

                    </div>


                    <div class="order-tracking-line
                        ${indiceAtual >= 3 ? "completed" : ""}">
                    </div>


                    <div class="order-tracking-step
                        ${indiceAtual >= 3 ? "completed" : ""}">

                        <div class="tracking-icon">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>

                        <span>
                            Entregue
                        </span>

                    </div>

                </div>
            `
        }


        <div class="order-total">

            <span>
                Total do pedido
            </span>

            <strong>
                ${formatCurrency(pedido.total)}
            </strong>

        </div>

    </div>
`;
                        }
                    )
                    .join("");

            } catch (error) {

                console.error(
                    "Erro ao carregar pedidos:",
                    error
                );


                ordersContent.innerHTML = `
                    <p class="orders-empty">
                        Erro ao conectar com o servidor.
                    </p>
                `;
            }
        }


if (profileOrdersButton) {

    profileOrdersButton.addEventListener(
        "click",
        async function () {

            closeProfileModal();

            openOrdersModal();

            await loadOrders();
        }
    );
}

        if (closeOrders) {

            closeOrders.addEventListener(
                "click",
                closeOrdersModal
            );
        }


        if (ordersOverlay) {

            ordersOverlay.addEventListener(
                "click",
                closeOrdersModal
            );
        }



        // ==========================================
        // MINHA CONTA
        // ==========================================

        const myAccountButton =
            document.getElementById(
                "myAccountButton"
            );

        const profileModal =
            document.getElementById(
                "profileModal"
            );

        const profileOverlay =
            document.getElementById(
                "profileOverlay"
            );

        const closeProfile =
            document.getElementById(
                "closeProfile"
            );

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );



        function openProfileModal() {

            if (profileModal) {

                profileModal.classList.add(
                    "active"
                );
            }


            if (profileOverlay) {

                profileOverlay.classList.add(
                    "active"
                );
            }
        }



        function closeProfileModal() {

            if (profileModal) {

                profileModal.classList.remove(
                    "active"
                );
            }


            if (profileOverlay) {

                profileOverlay.classList.remove(
                    "active"
                );
            }
        }



        async function loadProfile() {

            try {

                const response =
                    await fetch(
                        "/api/auth/me"
                    );


                if (
                    response.status ===
                    401
                ) {

                    closeProfileModal();


                    alert(
                        "Sua sessão expirou. Entre novamente."
                    );


                    resetLoggedUser();

                    openAccountModal();

                    return;
                }


                if (!response.ok) {

                    alert(
                        "Não foi possível carregar sua conta."
                    );

                    return;
                }


                const data =
                    await response.json();


                if (
                    data.cliente &&
                    profileName
                ) {

                    profileName.value =
                        data.cliente.nome ||
                        "";
                }


                if (
                    data.cliente &&
                    profileEmail
                ) {

                    profileEmail.value =
                        data.cliente.email ||
                        "";
                }

            } catch (error) {

                console.error(
                    "Erro ao carregar perfil:",
                    error
                );


                alert(
                    "Erro ao conectar com o servidor."
                );
            }
        }



        if (myAccountButton) {

            myAccountButton.addEventListener(
                "click",
                async function () {

                    closeAccountDropdown();

                    openProfileModal();

                    await loadProfile();
                }
            );
        }


        if (closeProfile) {

            closeProfile.addEventListener(
                "click",
                closeProfileModal
            );
        }


        if (profileOverlay) {

            profileOverlay.addEventListener(
                "click",
                closeProfileModal
            );
        }

                // ==========================================
        // ADMIN - BUSCA DE PRODUTOS
        // ==========================================

        const adminProductSearch =
            document.getElementById(
                "adminProductSearch"
            );


        if (adminProductSearch) {

            adminProductSearch.addEventListener(
                "input",
                function () {

                    const termo =
                        adminProductSearch
                            .value
                            .trim()
                            .toLowerCase();


                    const linhas =
                        document.querySelectorAll(
                            "[data-product-row]"
                        );


                    linhas.forEach(
                        function (linha) {

                            const texto =
                                linha.textContent
                                    .toLowerCase();


                            linha.style.display =
                                texto.includes(
                                    termo
                                )
                                    ? ""
                                    : "none";
                        }
                    );
                }
            );
        }



        // ==========================================
        // TECLA ESC
        // ==========================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;
                }


                closeCartDrawer();

                closeAccountModal();

                closeOrdersModal();

                closeProfileModal();

                closeAccountDropdown();
            }
        );



        // ==========================================
        // VERIFICA A SESSÃO AO CARREGAR
        // ==========================================

        checkLoggedUser();


        // ==========================================
        // BUSCA + CATEGORIAS - HOME
        // ==========================================

        const productSearch =
            document.getElementById(
                "productSearch"
            );

        const productSearchButton =
            document.getElementById(
                "productSearchButton"
            );

        const categoryFilters =
            document.querySelectorAll(
                "[data-category-filter]"
            );

        const homeProductCards =
            document.querySelectorAll(
                "[data-product-card]"
            );

        let activeCategory = "todos";


        function normalizeProductText(text) {

            return (text || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        }


function categoryMatches(
    selectedCategory,
    productCategory,
    isPremium
) {

    if (selectedCategory === "todos") {
        return true;
    }

    if (
        selectedCategory === "sofas" &&
        productCategory.includes("sofa")
    ) {
        return true;
    }

    if (
        selectedCategory === "colchoes" &&
        productCategory.includes("colch")
    ) {
        return true;
    }

    if (
        selectedCategory === "armarios" &&
        (
            productCategory.includes("armario") ||
            productCategory.includes("escrivaninha")
        )
    ) {
        return true;
    }

    if (
        selectedCategory === "mesa" &&
        (
            productCategory.includes("mesa") ||
            productCategory.includes("cadeira")
        )
    ) {
        return true;
    }

    if (
        selectedCategory === "multiuso" &&
        productCategory.includes("multiuso")
    ) {
        return true;
    }

    if (
        selectedCategory === "premium" &&
        isPremium
    ) {
        return true;
    }

    return false;
}


        function applyProductFilters() {

            const searchTerm =
                productSearch
                    ? normalizeProductText(
                        productSearch.value
                    )
                    : "";

            let visibleProducts = 0;

            homeProductCards.forEach(
                function (card) {

                    const productCategory =
                        normalizeProductText(
                            card.dataset.category || ""
                        );

                    const searchableText =
                        normalizeProductText(
                            [
                                card.dataset.name || "",
                                card.dataset.category || "",
                                card.dataset.color || "",
                                card.textContent || ""
                            ].join(" ")
                        );

                    const matchesSearch =
                        searchTerm === "" ||
                        searchableText.includes(
                            searchTerm
                        );

const isPremium =
    card.dataset.premium === "true";

const matchesCategory =
    categoryMatches(
        activeCategory,
        productCategory,
        isPremium
    );

                    const showProduct =
                        matchesSearch &&
                        matchesCategory;

                    card.style.display =
                        showProduct
                            ? ""
                            : "none";

                    if (showProduct) {
                        visibleProducts++;
                    }
                }
            );

            const emptyMessage =
                document.getElementById(
                    "emptyProductSearch"
                );

            if (emptyMessage) {

                emptyMessage.style.display =
                    visibleProducts === 0
                        ? "block"
                        : "none";
            }
        }


        if (productSearch) {

            productSearch.addEventListener(
                "input",
                applyProductFilters
            );

            productSearch.addEventListener(
                "keyup",
                applyProductFilters
            );
        }


        if (productSearchButton) {

            productSearchButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    applyProductFilters();
                }
            );
        }


        categoryFilters.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        activeCategory =
                            normalizeProductText(
                                button.dataset.categoryFilter ||
                                "todos"
                            );

                        categoryFilters.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );
                            }
                        );

                        button.classList.add(
                            "active"
                        );

                        applyProductFilters();
                    }
                );
            }
        );


        applyProductFilters();

    }
);
