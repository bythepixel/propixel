const formatCurrency = (value) =>
  `$${new Intl.NumberFormat("en-US").format(value)}`;

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const rows = Array.from(document.querySelectorAll(".table__row[data-hours]"));

let total = 0;
rows.forEach((row) => {
  const hours = Number(row.dataset.hours || 0);
  const rate = Number(row.dataset.rate || 0);
  const subtotal = hours * rate;
  total += subtotal;

  const hoursEl = row.querySelector(".js-hours");
  const rateEl = row.querySelector(".js-rate");
  const subtotalEl = row.querySelector(".js-subtotal");

  if (hoursEl) hoursEl.textContent = `${hours}`;
  if (rateEl) rateEl.textContent = formatCurrency(rate);
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
});

const totalEl = document.querySelector(".js-total");
if (totalEl) totalEl.textContent = formatCurrency(total);

const scrollButtons = Array.from(document.querySelectorAll("[data-scroll-to]"));
scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scrollTo);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const kickoffButton = document.querySelector("[data-action='kickoff']");
if (kickoffButton) {
  kickoffButton.addEventListener("click", () => {
    const nextSteps = document.querySelector("#next-steps");
    if (nextSteps) {
      nextSteps.classList.add("is-visible");
      nextSteps.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

const hero = document.querySelector(".hero");
const glows = Array.from(document.querySelectorAll(".hero__glow"));
if (hero && glows.length > 0) {
  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    glows.forEach((glow, index) => {
      const depth = (index + 1) * 16;
      glow.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
    });
  });

  hero.addEventListener("mouseleave", () => {
    glows.forEach((glow) => {
      glow.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

