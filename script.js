"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       Mobile Navigation
    ========================================== */

    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (mobileMenuToggle && navLinks) {

        mobileMenuToggle.addEventListener("click", () => {

            const expanded =
                mobileMenuToggle.getAttribute("aria-expanded") === "true";

            mobileMenuToggle.setAttribute(
                "aria-expanded",
                String(!expanded)
            );

            navLinks.classList.toggle("active");

        });

        // Close menu when clicking a navigation link
        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");
                mobileMenuToggle.setAttribute("aria-expanded", "false");

            });

        });

        // Close menu when clicking outside
        document.addEventListener("click", (event) => {

            if (
                !navLinks.contains(event.target) &&
                !mobileMenuToggle.contains(event.target)
            ) {

                navLinks.classList.remove("active");
                mobileMenuToggle.setAttribute("aria-expanded", "false");

            }

        });

    }

    /* ==========================================
       FAQ Accordion
    ========================================== */

    const accordionItems = document.querySelectorAll(".accordion-item");

    accordionItems.forEach(item => {

        const header = item.querySelector(".accordion-header");

        if (!header) return;

        header.addEventListener("click", () => {

            const isActive = item.classList.contains("active");

            accordionItems.forEach(otherItem => {

                otherItem.classList.remove("active");

                const otherHeader =
                    otherItem.querySelector(".accordion-header");

                const otherContent =
                    otherItem.querySelector(".accordion-content");

                if (otherHeader)
                    otherHeader.setAttribute("aria-expanded", "false");

                if (otherContent)
                    otherContent.setAttribute("aria-hidden", "true");

            });

            if (!isActive) {

                item.classList.add("active");

                header.setAttribute("aria-expanded", "true");

                const content =
                    item.querySelector(".accordion-content");

                if (content)
                    content.setAttribute("aria-hidden", "false");

            }

        });

    });

    /* ==========================================
       Smooth Scroll
    ========================================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

    /* ==========================================
       Sticky Header Shadow
    ========================================== */

    const header = document.getElementById("main-header");

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
