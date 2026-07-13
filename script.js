"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ===========================
       Mobile Navigation
    =========================== */

    const menuBtn = document.querySelector(".mobile-menu-toggle");
    const nav = document.querySelector(".nav-links");

    if (menuBtn && nav) {

        menuBtn.addEventListener("click", () => {

            const expanded =
                menuBtn.getAttribute("aria-expanded") === "true";

            menuBtn.setAttribute(
                "aria-expanded",
                String(!expanded)
            );

            nav.classList.toggle("active");

        });

        // Close menu after clicking a link
        nav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                nav.classList.remove("active");
                menuBtn.setAttribute("aria-expanded", "false");

            });

        });

        // Close menu when clicking outside
        document.addEventListener("click", (event) => {

            if (
                !nav.contains(event.target) &&
                !menuBtn.contains(event.target)
            ) {

                nav.classList.remove("active");
                menuBtn.setAttribute("aria-expanded", "false");

            }

        });

    }

    /* ===========================
       FAQ Accordion
    =========================== */

    const accordionItems =
        document.querySelectorAll(".accordion-item");

    accordionItems.forEach(item => {

        const header =
            item.querySelector(".accordion-header");

        const content =
            item.querySelector(".accordion-content");

        if (!header || !content) return;

        header.addEventListener("click", () => {

            const isOpen =
                item.classList.contains("active");

            accordionItems.forEach(other => {

                other.classList.remove("active");

                other.querySelector(".accordion-header")
                    ?.setAttribute("aria-expanded", "false");

                other.querySelector(".accordion-content")
                    ?.setAttribute("aria-hidden", "true");

            });

            if (!isOpen) {

                item.classList.add("active");

                header.setAttribute(
                    "aria-expanded",
                    "true"
                );

                content.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }

        });

    });

    /* ===========================
       Smooth Scroll
    =========================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target =
                document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });

        });

    });

    /* ===========================
       Sticky Header Effect
    =========================== */

    const header =
        document.getElementById("main-header");

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 10) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        }, {
            passive: true
        });

    }

});
