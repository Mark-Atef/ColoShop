window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (window.scrollY > 0) {
    header.style.top = "0"; 
  } else {
    header.style.top = "32px";
  }
});

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('nav.nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("products")) {
    const API = "https://dummyjson.com/products?limit=100";
    const productsEl = document.getElementById("products");
    const emptyEl = document.getElementById("products-empty");
    const paginationEl = document.getElementById("pagination");
    const searchInput = document.getElementById("search");
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

    const womenCats = ["womens-dresses","womens-shoes","womens-watches","womens-bags","womens-jewellery"];
    const menCats = ["mens-shirts","mens-shoes","mens-watches"];
    const accessoriesCats = ["sunglasses","fragrances","skincare","groceries","home-decoration","tops","womens-necklaces"];
    function mapCategory(cat) {
      if (womenCats.includes(cat)) return "women";
      if (menCats.includes(cat)) return "men";
      if (accessoriesCats.includes(cat)) return "accessories";
      return "other";
    }

    let allProducts = [], filteredProducts = [];
    let currentFilter = "all", page = 1;
    const perPage = 8;

    let cartCount = localStorage.getItem("coloshop_cart_count") ? parseInt(localStorage.getItem("coloshop_cart_count"), 10) : 0;
    function updateCartUI() {
      document.querySelectorAll(".cart-count").forEach(el => el.textContent = cartCount);
      localStorage.setItem("coloshop_cart_count", cartCount);
    }
    updateCartUI();

    async function fetchProducts() {
      productsEl.innerHTML = `<div class="empty">Loading products...</div>`;
      try {
        const res = await fetch(API);
        const data = await res.json();
        allProducts = (data.products || []).map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          discount: p.discountPercentage || 0,
          category: p.category,
          thumbnail: p.thumbnail || (p.images && p.images[0]) || "",
          description: p.description || ""
        }));
        applyAllFilters();
      } catch (err) {
        productsEl.innerHTML = `<div class="empty">Failed to load products.</div>`;
        console.error(err);
      }
    }

    function renderProducts(list) {
  if (!list || list.length === 0) {
    productsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    paginationEl.innerHTML = "";
    return;
  }
  emptyEl.classList.add("hidden");

  const start = (page - 1) * perPage;
  const slice = list.slice(start, start + perPage);
  productsEl.innerHTML = slice.map(p => {
    const oldPrice = p.discount ? (p.price / (1 - p.discount / 100)).toFixed(2) : "";
    const badge = p.discount ? `-${Math.round(p.discount)}%` : "";
    return `
      <article class="product-card" data-id="${p.id}" data-cat="${p.category}">
        ${badge ? `<div class="badge">${badge}</div>` : ""}
        <img src="${p.thumbnail}" loading="lazy" alt="${escapeHtml(p.title)}">
        <div class="product-title">${escapeHtml(p.title)}</div>
        <div class="product-price">
          ${oldPrice ? `<span class="product-old">$${oldPrice}</span>` : ""}
          <span>$${p.price}</span>
        </div>
        <button class="btn-add" data-id="${p.id}">Add to Cart</button>
      </article>`;
  }).join("");

  document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      cartCount++;
      updateCartUI();
      btn.textContent = "Added ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 1200);
    });
  });

  renderPagination(list.length);
}

    function renderPagination(totalItems) {
      const totalPages = Math.ceil(totalItems / perPage);
      if (totalPages <= 1) { paginationEl.innerHTML = ""; return; }
      let html = `<button class="page-btn" data-page="${Math.max(1, page-1)}">Prev</button>`;
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      html += `<button class="page-btn" data-page="${Math.min(totalPages, page+1)}">Next</button>`;
      paginationEl.innerHTML = html;

      paginationEl.querySelectorAll(".page-btn").forEach(b => {
        b.addEventListener("click", () => {
          const p = Number(b.dataset.page);
          if (!isNaN(p)) {
            page = p;
            renderProducts(filteredProducts);
            window.scrollTo({ top: document.getElementById("shop").offsetTop - 70, behavior: "smooth" });
          }
        });
      });
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, m =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
      );
    }

    function applyAllFilters() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      filteredProducts = allProducts.filter(p => {
        if (currentFilter !== "all" && mapCategory(p.category) !== currentFilter) return false;
        if (query && !p.title.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query)) return false;
        return true;
      });
      page = 1;
      renderProducts(filteredProducts);
    }

    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        applyAllFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        applyAllFilters();
      });
    }

    fetchProducts();
  }
});
  // -------------------------
  // CONTACT FORM (contact.html)
  // -------------------------
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const feedback = document.getElementById("contact-feedback");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      feedback.textContent = "";
      // remove previous invalid
      contactForm.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));

      const name = contactForm.querySelector("#name");
      const email = contactForm.querySelector("#email");
      const message = contactForm.querySelector("#message");

      let ok = true;
      if (!name.value.trim()) { name.classList.add("is-invalid"); ok = false; }
      if (!validateEmail(email.value)) { email.classList.add("is-invalid"); ok = false; }
      if (!message.value.trim()) { message.classList.add("is-invalid"); ok = false; }

      if (!ok) {
        feedback.style.color = "#e74c3c";
        feedback.textContent = "Please correct the highlighted fields.";
        return;
      }

      // simulate success
      feedback.style.color = "green";
      feedback.textContent = "Message sent — thank you! We'll get back shortly.";
      contactForm.reset();
      setTimeout(()=> feedback.textContent = "", 6000);
    });

    // live validation clearing
    contactForm.querySelectorAll("input,textarea").forEach(inp => {
      inp.addEventListener("input", () => inp.classList.remove("is-invalid"));
    });
  }

  // Newsletter subscribe (simple)
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletter-email");
      if (!validateEmail(input.value)) {
        input.classList.add("is-invalid");
        setTimeout(()=> input.classList.remove("is-invalid"), 2000);
        return;
      }
      alert("Thanks for subscribing!");
      input.value = "";
    });
  }

  // simple email validator
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  // expose cart update (Add to cart uses cartCount variable)
  window.addToCart = function() {
    cartCount++;
    updateCartUI();
  };

; // DOMContentLoaded
{
}
