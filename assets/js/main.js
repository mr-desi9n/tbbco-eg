/* ==========================================================================
   TABBCO FOR TRADE, CONTRACTING & ENGINEERING SERVICES
   Interactive Client-Side Logic (Zero Dependencies)
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (menuBtn && mobileDrawer) {
    const closeDrawer = () => {
      mobileDrawer.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        closeDrawer();
        menuBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     1b. Products Dropdown (Desktop Hover + Click + Keyboard) & Mobile Submenu
     ------------------------------------------------------------------------ */
  const dropdownContainers = document.querySelectorAll('.nav-dropdown');
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  dropdownContainers.forEach((container) => {
    const trigger = container.querySelector('.dropdown-trigger');
    const menu = container.querySelector('.dropdown-list');
    if (!trigger || !menu) return;

    let hoverPreview = false;

    const setOpen = (open, isHover = false) => {
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      hoverPreview = open && isHover;
    };

    trigger.addEventListener('click', () => {
      if (hoverPreview) {
        hoverPreview = false;
        return;
      }
      setOpen(menu.hidden, false);
    });

    if (supportsHover) {
      container.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'touch' && menu.hidden) {
          setOpen(true, true);
        }
      });

      container.addEventListener('pointerleave', () => {
        if (hoverPreview) {
          setOpen(false, false);
        }
      });
    }

    container.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !container.contains(e.relatedTarget)) {
        setOpen(false, false);
      }
    });

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        setOpen(false, false);
        trigger.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!menu.hidden && !container.contains(e.target)) {
        setOpen(false, false);
      }
    });
  });

  const subdrawerBtns = document.querySelectorAll('[data-subdrawer-toggle]');
  subdrawerBtns.forEach((btn) => {
    const targetId = btn.getAttribute('aria-controls');
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    btn.addEventListener('click', () => {
      const willOpen = target.hidden;
      target.hidden = !willOpen;
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  /* ------------------------------------------------------------------------
     2. Floating WhatsApp Channel Selector
     ------------------------------------------------------------------------ */
  const waToggle = document.querySelector('[data-wa-toggle]');
  const waMenu = document.getElementById('wa-menu');

  if (waToggle && waMenu) {
    const setWaOpen = (open) => {
      waMenu.hidden = !open;
      waToggle.setAttribute('aria-expanded', String(open));
    };

    waToggle.addEventListener('click', () => {
      setWaOpen(waMenu.hidden);
    });

    document.addEventListener('click', (e) => {
      if (!waMenu.hidden && !e.target.closest('.wa-widget')) {
        setWaOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !waMenu.hidden) {
        setWaOpen(false);
        waToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. Scroll-Reveal Observer (Respects Reduced Motion)
     ------------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => observer.observe(el));
    }
  }

  /* ------------------------------------------------------------------------
     4. Projects Page Category Filter
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('[data-category]');
  const filterStatus = document.getElementById('filter-status');

  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.filter;

        filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

        let visibleCount = 0;
        projectCards.forEach((card) => {
          const matches = selected === 'all' || card.dataset.category === selected;
          card.hidden = !matches;
          if (matches) visibleCount += 1;
        });

        if (filterStatus) {
          filterStatus.textContent = `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'} for ${btn.textContent.trim()}.`;
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Services Page Sticky Side-Nav Active Highlight
     ------------------------------------------------------------------------ */
  const divisionSections = document.querySelectorAll('.division-block[id]');
  const sidenavLinks = document.querySelectorAll('.services-sidenav__link');

  if (divisionSections.length && sidenavLinks.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            sidenavLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-25% 0px -60% 0px' }
    );

    divisionSections.forEach((sec) => navObserver.observe(sec));
  }

  /* ------------------------------------------------------------------------
     6. RFQ / Contact Form: Pre-selection, Validation & Accessible ARIA Sync
     ------------------------------------------------------------------------ */
  const rfqForm = document.getElementById('rfq-form');
  if (rfqForm) {
    // Pre-select division from query string (e.g. contact.html?division=trading)
    const params = new URLSearchParams(window.location.search);
    const divisionParam = params.get('division');
    const divisionSelect = document.getElementById('division');
    if (divisionParam && divisionSelect) {
      const normalized = divisionParam.toLowerCase();
      const option = [...divisionSelect.options].find(
        (opt) => opt.value.toLowerCase() === normalized
      );
      if (option) divisionSelect.value = option.value;
    }

    // Pre-fill product name in scope if navigated from a product page
    const productParam = params.get('product');
    const scopeField = document.getElementById('scope');
    if (productParam && scopeField && !scopeField.value) {
      scopeField.value = `Requesting quotation & technical datasheet for: ${productParam}\nQuantity / Specifications: `;
    }

    // Consistent ARIA & :user-invalid fallback experience
    const linkError = (el, shown) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    document.body.append(announcer);
    let announceTimer;
    let announcedField;

    const spokenText = (node) => {
      const copy = node.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      copy
        .querySelectorAll('[role="img"][aria-label]')
        .forEach((n) => n.replaceWith(`${n.getAttribute('aria-label')}: `));
      return copy.textContent.replace(/\s+/g, ' ').trim();
    };

    const announceError = (el) => {
      const error = document.getElementById(el.dataset.error);
      if (!error) return;
      const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : '';
      clearTimeout(announceTimer);
      announcer.textContent = '';
      announcedField = el;
      announceTimer = setTimeout(() => {
        announcer.textContent = label + spokenText(error);
      }, 500);
    };

    const supportsUserInvalid = CSS.supports('selector(:user-invalid)');
    const dirtyState = new WeakMap();
    const announced = new WeakSet();

    const syncFieldAria = (el, announce = false) => {
      if (!el.matches?.('input, select, textarea')) return;
      const isInvalid = supportsUserInvalid
        ? el.matches(':user-invalid')
        : el.classList.contains('user-invalid-fallback');

      if (isInvalid) {
        if (announce && !announced.has(el)) {
          announceError(el);
          announced.add(el);
        }
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
      } else {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        announced.delete(el);
        if (announcedField === el) {
          clearTimeout(announceTimer);
          announcer.textContent = '';
        }
      }
    };

    rfqForm.querySelectorAll('input, select, textarea').forEach((el) => {
      el.setAttribute('aria-invalid', 'false');
    });

    if (!supportsUserInvalid) {
      const updateFallback = (input) => {
        const valid = input.validity.valid;
        input.classList.toggle('user-invalid-fallback', !valid);
        input.classList.toggle('user-valid-fallback', valid);
        syncFieldAria(input, !valid);
      };

      rfqForm.addEventListener(
        'blur',
        (e) => {
          const el = e.target;
          if (!el.checkValidity) return;
          const state = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
          state.hasBlurred = true;
          dirtyState.set(el, state);
          if (state.hasInteracted) updateFallback(el);
        },
        true
      );

      rfqForm.addEventListener('input', (e) => {
        const el = e.target;
        if (!el.checkValidity) return;
        const state = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        state.hasInteracted = true;
        dirtyState.set(el, state);
        if (state.hasBlurred) updateFallback(el);
      });

      rfqForm.addEventListener('change', (e) => {
        const el = e.target;
        if (!el.checkValidity) return;
        const state = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        state.hasInteracted = true;
        dirtyState.set(el, state);
        if (state.hasBlurred) updateFallback(el);
      });
    } else {
      rfqForm.addEventListener('blur', (e) => syncFieldAria(e.target, true), true);
      rfqForm.addEventListener('input', (e) => {
        if (e.target.hasAttribute('aria-invalid')) syncFieldAria(e.target);
      });
      rfqForm.addEventListener('change', (e) => syncFieldAria(e.target, true), true);
    }

    rfqForm.addEventListener(
      'invalid',
      (e) => {
        if (!supportsUserInvalid) {
          dirtyState.set(e.target, { hasInteracted: true, hasBlurred: true });
          e.target.classList.add('user-invalid-fallback');
          e.target.classList.remove('user-valid-fallback');
        }
        announced.add(e.target);
        syncFieldAria(e.target);
      },
      true
    );

    const statusPanel = document.getElementById('rfq-status');
    const submitBtn = document.getElementById('rfq-submit');

    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!rfqForm.checkValidity()) {
        const firstInvalid = rfqForm.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';
      }

      const formData = new FormData(rfqForm);
      const clientName = formData.get('full_name') || 'Partner';
      const division = formData.get('division') || 'General Inquiry';

      setTimeout(() => {
        rfqForm.reset();
        rfqForm.querySelectorAll('input, select, textarea').forEach((el) => {
          el.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          el.setAttribute('aria-invalid', 'false');
          linkError(el, false);
        });

        if (statusPanel) {
          statusPanel.hidden = false;
          statusPanel.innerHTML = `
            <strong>Request Received — Thank you, ${String(clientName).replace(/[<>&"]/g, '')}.</strong>
            <p style="margin: 0.4rem 0 0;">Your inquiry regarding <strong>${String(division).replace(/[<>&"]/g, '')}</strong> has been logged for our Obour City engineering &amp; procurement desk. A specialist will respond within 1 business day, or you may reach us immediately on WhatsApp at <a href="https://wa.me/201004939258" style="text-decoration:underline;font-weight:700;">+20 100 493 9258</a>.</p>
          `;
          statusPanel.focus();
        }

        document.title = 'Request Received | Tabbco for Trade, Contracting & Engineering';

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Request for Quote';
        }
      }, 350);
    });
  }

  /* ------------------------------------------------------------------------
     7. Fullscreen Product Image Lightbox (<dialog closedby="any"> + fallback)
     ------------------------------------------------------------------------ */
  const lightboxTriggers = document.querySelectorAll('[data-lightbox-src]');
  if (lightboxTriggers.length) {
    const lightbox = document.createElement('dialog');
    lightbox.id = 'image-lightbox';
    lightbox.className = 'lightbox-dialog';
    lightbox.setAttribute('closedby', 'any');
    lightbox.setAttribute('aria-labelledby', 'lightbox-caption');
    lightbox.innerHTML = `
      <div class="lightbox-dialog__frame">
        <img class="lightbox-dialog__img" src="" alt="">
        <div class="lightbox-dialog__bar">
          <p id="lightbox-caption" class="lightbox-dialog__caption"></p>
          <form method="dialog">
            <button type="submit" class="btn btn--dark btn--sm" autofocus>Close</button>
          </form>
        </div>
      </div>
    `;
    document.body.append(lightbox);

    const lbImg = lightbox.querySelector('.lightbox-dialog__img');
    const lbCaption = lightbox.querySelector('#lightbox-caption');

    lightboxTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const src = trigger.dataset.lightboxSrc;
        const alt = trigger.dataset.lightboxAlt || 'Product image';
        if (!src || !lbImg || !lbCaption) return;
        lbImg.src = src;
        lbImg.alt = alt;
        lbCaption.textContent = alt;
        lightbox.showModal();
      });
    });

    lightbox.addEventListener('close', () => {
      lightbox.returnValue = '';
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dlg) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      lightbox.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, lightbox);
      });
      lightbox.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, lightbox)) {
          lightbox.close();
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     8. Scroll-Driven Services Card Stacking Fallback (Non-view()-timeline browsers)
     ------------------------------------------------------------------------ */
  const serviceRows = document.querySelectorAll('.services-showcase .service-row');
  if (
    serviceRows.length &&
    !CSS.supports('(animation-timeline: view()) and (animation-range: entry)') &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
    'IntersectionObserver' in window
  ) {
    const stackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = Math.min(1, Math.max(0, entry.intersectionRatio));
          const scale = 0.94 + ratio * 0.06;
          const opacity = 0.55 + ratio * 0.45;
          entry.target.style.transform = `scale(${scale.toFixed(3)})`;
          entry.target.style.opacity = opacity.toFixed(3);
        });
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    serviceRows.forEach((row) => stackObserver.observe(row));
  }

  /* ------------------------------------------------------------------------
     9. Homepage Products Horizontal Scroll Carousel
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.products-carousel__track');
    const prevBtn = carousel.querySelector('[data-direction="previous"]');
    const nextBtn = carousel.querySelector('[data-direction="next"]');
    const markersNav = carousel.querySelector('.products-carousel__markers');
    const statusEl = carousel.querySelector('[role="status"]');
    if (!track || !prevBtn || !nextBtn || !markersNav) return;

    const slides = [...track.children];
    if (!slides.length) return;

    let currentIdx = 0;
    let settledIdx = 0;
    let pendingTarget = null;
    let rafId = null;
    let scrollFallbackTimer = null;

    // Build marker dots from data-marker-name
    const markers = slides.map((slide, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'products-carousel__marker';
      btn.setAttribute('aria-label', slide.dataset.markerName || `Go to slide ${idx + 1}`);
      if (idx === 0) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', () => goToSlide(idx));
      markersNav.append(btn);
      return btn;
    });

    const getNearestSlideIndex = () => {
      const trackLeft = track.scrollLeft;
      let bestIdx = 0;
      let bestDist = Infinity;
      slides.forEach((slide, idx) => {
        const dist = Math.abs(slide.offsetLeft - trackLeft);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });
      return bestIdx;
    };

    const setActiveMarker = (idx) => {
      if (idx === currentIdx && markers[idx]?.getAttribute('aria-current') === 'true') return;
      currentIdx = idx;
      markers.forEach((m, i) => {
        if (i === idx) m.setAttribute('aria-current', 'true');
        else m.removeAttribute('aria-current');
      });
    };

    const syncButtons = () => {
      const atStart = track.scrollLeft <= 4;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      const prevHadFocus = document.activeElement === prevBtn;
      const nextHadFocus = document.activeElement === nextBtn;

      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;

      if (atStart && prevHadFocus && !nextBtn.disabled) nextBtn.focus();
      if (atEnd && nextHadFocus && !prevBtn.disabled) prevBtn.focus();
    };

    const goToSlide = (idx) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, idx));
      pendingTarget = clamped;
      setActiveMarker(clamped);
      const targetLeft = slides[clamped].offsetLeft;
      track.scrollBy({ left: targetLeft - track.scrollLeft });
    };

    prevBtn.addEventListener('click', () => {
      const base = pendingTarget !== null ? pendingTarget : getNearestSlideIndex();
      goToSlide(base - 1);
    });

    nextBtn.addEventListener('click', () => {
      const base = pendingTarget !== null ? pendingTarget : getNearestSlideIndex();
      goToSlide(base + 1);
    });

    const onSettle = () => {
      const idx = getNearestSlideIndex();
      pendingTarget = null;
      setActiveMarker(idx);
      syncButtons();
      if (idx !== settledIdx) {
        settledIdx = idx;
        if (statusEl) {
          statusEl.textContent = `Slide ${idx + 1} of ${slides.length}`;
        }
      }
    };

    track.addEventListener('scroll', () => {
      if (pendingTarget === null && rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          setActiveMarker(getNearestSlideIndex());
          syncButtons();
        });
      }
      if (!('onscrollend' in window)) {
        clearTimeout(scrollFallbackTimer);
        scrollFallbackTimer = setTimeout(onSettle, 120);
      }
    });

    if ('onscrollend' in window) {
      track.addEventListener('scrollend', onSettle);
    }

    window.addEventListener('resize', syncButtons);
    syncButtons();
  });

  /* ------------------------------------------------------------------------
     10. Hero Background Video Pause / Play & Reduced Motion Respect
     ------------------------------------------------------------------------ */
  const heroVideo = document.querySelector('.hero video.hero__bg');
  const heroVideoToggle = document.querySelector('[data-hero-video-toggle]');
  if (heroVideo && heroVideoToggle) {
    const updateToggleLabel = () => {
      heroVideoToggle.textContent = heroVideo.paused ? 'Play Video' : 'Pause Video';
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    }
    updateToggleLabel();

    heroVideoToggle.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
      } else {
        heroVideo.pause();
      }
    });

    heroVideo.addEventListener('play', updateToggleLabel);
    heroVideo.addEventListener('pause', updateToggleLabel);
  }
})();
