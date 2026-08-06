(function () {
    "use strict";

    var PHOTOS = [
        "assets/WhatsApp%20Image%202026-08-06%20at%201.58.00%20PM.jpeg",
        "assets/WhatsApp%20Image%202026-08-06%20at%201.58.00%20PM%20(1).jpeg",
        "assets/WhatsApp%20Image%202026-08-06%20at%201.58.01%20PM.jpeg",
        "assets/WhatsApp%20Image%202026-08-06%20at%201.58.01%20PM%20(1).jpeg",
        "assets/WhatsApp%20Image%202026-08-06%20at%201.58.01%20PM%20(2).jpeg",
        "assets/WhatsApp%20Image%202026-08-06%20at%201.58.02%20PM.jpeg"
    ];

    var BIRTH_DATE = new Date(2002, 7, 7, 0, 0, 0);

    /* ---------- typewriter for the birthday message ---------- */
    function typewriter(element, interval, callback) {
        var str = element.innerHTML;
        element.innerHTML = "";
        var progress = 0;
        var timer = setInterval(function () {
            var current = str.substr(progress, 1);
            if (current === "<") {
                progress = str.indexOf(">", progress) + 1;
            } else {
                progress++;
            }
            element.innerHTML = str.substring(0, progress) + (progress % 2 ? "_" : "");
            if (progress >= str.length) {
                clearInterval(timer);
                if (callback) callback();
            }
        }, interval);
    }

    /* ---------- heart (flower petal blooms) canvas ---------- */
    var HEART_SCALE = 0.8;

    function heartCoords(t) {
        return {
            x: 19.5 * (16 * Math.pow(Math.sin(t), 3)),
            y: -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
        };
    }

    function getHeartPoint(angle, offsetX, offsetY) {
        var c = heartCoords(angle / Math.PI);
        return [offsetX + c.x * HEART_SCALE, offsetY + c.y * HEART_SCALE];
    }

    function startHeartAnimation(garden, offsetX, offsetY) {
        var interval = 50;
        var angle = 10;
        var heart = [];
        var animationTimer = setInterval(function () {
            var bloom = getHeartPoint(angle, offsetX, offsetY);
            var draw = true;
            for (var i = 0; i < heart.length; i++) {
                var p = heart[i];
                var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
                if (distance < Garden.options.bloomRadius.max * 1.3) {
                    draw = false;
                    break;
                }
            }
            if (draw) {
                heart.push(bloom);
                garden.createRandomBloom(bloom[0], bloom[1]);
            }
            if (angle >= 30) {
                clearInterval(animationTimer);
            } else {
                angle += 0.2;
            }
        }, interval);
        return animationTimer;
    }

    function startHeart() {
        var canvas = document.getElementById("garden");
        if (!canvas || !canvas.getContext) return;
        var ctx = canvas.getContext("2d");
        var dpr = window.devicePixelRatio || 1;

        var w = canvas.clientWidth || 620;
        var h = canvas.clientHeight || 600;
        var garden = new Garden(ctx, canvas);
        var heartTimer = null;

        function drawBaseHeart() {
            var ox = w / 2;
            var oy = h / 2 - 40;
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            ctx.translate(ox, oy);
            ctx.scale(HEART_SCALE, HEART_SCALE);
            ctx.beginPath();
            for (var t = 0; t <= Math.PI * 2; t += 0.03) {
                var c = heartCoords(t);
                if (t === 0) ctx.moveTo(c.x, c.y);
                else ctx.lineTo(c.x, c.y);
            }
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 77, 109, 0.12)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 120, 140, 0.55)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }

        function resize() {
            w = canvas.clientWidth || 620;
            h = canvas.clientHeight || 600;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.globalCompositeOperation = "lighter";
        }
        resize();
        drawBaseHeart();

        function restartHeart() {
            if (heartTimer) clearInterval(heartTimer);
            garden.clear();
            drawBaseHeart();
            var offsetX = w / 2;
            var offsetY = h / 2 - 40;
            setTimeout(function () {
                heartTimer = startHeartAnimation(garden, offsetX, offsetY);
            }, 400);
        }

        setInterval(function () {
            garden.render();
        }, Garden.options.growSpeed);

        restartHeart();

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resize();
                restartHeart();
            }, 250);
        });
    }

    /* ---------- age clock (years / months / days / hr / min / sec) ---------- */
    function startCountdown() {
        var ageEl = document.getElementById("ageText");
        var cdEl = document.getElementById("countdownText");
        if (!ageEl || !cdEl) return;

        function pad(n) { return n < 10 ? "0" + n : "" + n; }

        function tick() {
            var now = new Date();
            var years = now.getFullYear() - BIRTH_DATE.getFullYear();
            var months = now.getMonth() - BIRTH_DATE.getMonth();
            var days = now.getDate() - BIRTH_DATE.getDate();
            if (days < 0) {
                months--;
                days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var seconds = now.getSeconds();

            ageEl.textContent = "Himanshi's Age";
            cdEl.innerHTML =
                "<span class=\"digit\">" + years + "</span> Years <span class=\"digit\">" + months +
                "</span> Months <span class=\"digit\">" + days + "</span> Days<br/>" +
                "<span class=\"digit\">" + pad(hours) + "</span> Hours <span class=\"digit\">" + pad(minutes) +
                "</span> Min <span class=\"digit\">" + pad(seconds) + "</span> Sec";
        }

        tick();
        setInterval(tick, 1000);
    }

    /* ---------- floating photo bubbles ---------- */
    function startBubbles() {
        var layer = document.getElementById("bgLayer");
        var lightbox = document.getElementById("lightbox");
        var lbImg = document.getElementById("lightboxImg");
        if (!layer) return;

        var movers = [];
        var codeRect = null;

        function docHeight() {
            return Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                window.innerHeight
            );
        }

        function setLayerHeight() {
            layer.style.height = docHeight() + "px";
        }

        function protectedRects() {
            return ["code", "words"].map(function (id) {
                var el = document.getElementById(id);
                if (!el) return null;
                var r = el.getBoundingClientRect();
                return {
                    left: r.left,
                    top: r.top + window.scrollY,
                    right: r.right,
                    bottom: r.bottom + window.scrollY
                };
            }).filter(Boolean);
        }

        function updateCodeRect() {
            var el = document.getElementById("code");
            if (!el) return;
            var r = el.getBoundingClientRect();
            codeRect = {
                left: r.left - 4,
                top: r.top + window.scrollY - 4,
                right: r.right + 4,
                bottom: r.bottom + window.scrollY + 4
            };
        }

        function overlaps(rect, others) {
            for (var i = 0; i < others.length; i++) {
                var o = others[i];
                if (rect.right > o.left + 6 && rect.left < o.right - 6 &&
                    rect.bottom > o.top + 6 && rect.top < o.bottom - 6) {
                    return true;
                }
            }
            return false;
        }

        function randomFrom(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function spawn() {
            var vw = window.innerWidth;
            var dh = docHeight();
            var isMobile = vw <= 760;
            var wanted = isMobile ? 10 : 14;
            var used = [];
            var attempts = 0;
            while (movers.length < wanted && attempts < 500) {
                attempts++;
                var size = isMobile ? 48 + Math.random() * 24 : 70 + Math.random() * 40;
                var x = 16 + Math.random() * (vw - size - 32);
                var y = 16 + Math.random() * (dh - size - 32);
                var rect = { left: x, top: y, right: x + size, bottom: y + size };
                if (overlaps(rect, protectedRects())) continue;

                var collision = false;
                for (var i = 0; i < used.length; i++) {
                    var b = used[i];
                    if (rect.left < b.r && rect.right > b.l && rect.top < b.b && rect.bottom > b.t) {
                        collision = true;
                        break;
                    }
                }
                if (collision) continue;

                used.push({ l: rect.left - 40, r: rect.right + 40, t: rect.top - 40, b: rect.bottom + 40 });

                var bub = document.createElement("div");
                bub.className = "bubble";
                bub.style.width = size + "px";
                bub.style.height = size + "px";
                bub.style.left = x + "px";
                bub.style.top = y + "px";
                bub.style.animationDuration = (5 + Math.random() * 4) + "s";
                bub.style.animationDelay = (-Math.random() * 6) + "s";

                var img = document.createElement("img");
                img.alt = "memory";
                img.src = randomFrom(PHOTOS);
                img.addEventListener("click", function (e) {
                    e.stopPropagation();
                    lbImg.src = this.src;
                    lightbox.classList.add("show");
                });
                bub.appendChild(img);
                layer.appendChild(bub);

                movers.push({
                    el: bub,
                    x: x,
                    y: y,
                    size: size,
                    vx: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.7),
                    vy: (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.6)
                });
            }
        }

        function clear() {
            var els = layer.querySelectorAll(".bubble");
            for (var i = 0; i < els.length; i++) els[i].remove();
            movers = [];
        }

        function moveFrame() {
            var vw = window.innerWidth;
            var dh = docHeight();
            for (var i = 0; i < movers.length; i++) {
                var m = movers[i];
                m.x += m.vx;
                m.y += m.vy;

                if (m.x < 6) { m.x = 6; m.vx = Math.abs(m.vx); }
                else if (m.x > vw - m.size - 6) { m.x = vw - m.size - 6; m.vx = -Math.abs(m.vx); }
                if (m.y < 6) { m.y = 6; m.vy = Math.abs(m.vy); }
                else if (m.y > dh - m.size - 6) { m.y = dh - m.size - 6; m.vy = -Math.abs(m.vy); }

                if (codeRect) {
                    var cx = m.x + m.size / 2;
                    var cy = m.y + m.size / 2;
                    var r = m.size / 2;
                    if (cx > codeRect.left - r && cx < codeRect.right + r &&
                        cy > codeRect.top - r && cy < codeRect.bottom + r) {
                        var leftD = cx - (codeRect.left - r);
                        var rightD = (codeRect.right + r) - cx;
                        var topD = cy - (codeRect.top - r);
                        var bottomD = (codeRect.bottom + r) - cy;
                        var minD = Math.min(leftD, rightD, topD, bottomD);
                        if (minD === leftD) { m.x = codeRect.left - m.size - 6; m.vx = -Math.abs(m.vx); }
                        else if (minD === rightD) { m.x = codeRect.right + 6; m.vx = Math.abs(m.vx); }
                        else if (minD === topD) { m.y = codeRect.top - m.size - 6; m.vy = -Math.abs(m.vy); }
                        else { m.y = codeRect.bottom + 6; m.vy = Math.abs(m.vy); }
                    }
                }

                m.el.style.left = m.x + "px";
                m.el.style.top = m.y + "px";
            }
            requestAnimationFrame(moveFrame);
        }

        setLayerHeight();
        spawn();
        updateCodeRect();
        setInterval(updateCodeRect, 300);
        requestAnimationFrame(moveFrame);
        window.addEventListener("load", setLayerHeight);

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                clear();
                setLayerHeight();
                spawn();
                updateCodeRect();
            }, 300);
        });
    }

    /* ---------- SVG flowers ---------- */
    function startFlowers() {
        var layer = document.getElementById("flowerLayer");
        if (!layer) return;

        function docHeight() {
            return Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                window.innerHeight
            );
        }

        var palettes = [
            ["#ff8fa3", "#ff4d6d", "#ffd166"],
            ["#ffd6e0", "#f783ac", "#ffd166"],
            ["#ffc4d6", "#ff4d6d", "#ffe66d"],
            ["#ffe5ec", "#f76f8e", "#ffb703"],
            ["#ff9eaa", "#e05263", "#ffd166"]
        ];

        function flowerSVG(petals, petalColor, outline, centerColor) {
            var svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';
            for (var i = 0; i < petals; i++) {
                var angle = i * (360 / petals);
                svg += '<ellipse cx="50" cy="24" rx="15" ry="27" fill="' + petalColor +
                    '" stroke="' + outline + '" stroke-width="1" transform="rotate(' + angle + ' 50 50)"/>';
            }
            svg += '<circle cx="50" cy="50" r="11" fill="' + centerColor + '"/>';
            svg += '<circle cx="46" cy="46" r="3" fill="rgba(255,255,255,0.7)"/>';
            svg += '</svg>';
            return svg;
        }

        function spawn() {
            var vw = window.innerWidth;
            var dh = docHeight();
            var isMobile = vw <= 760;
            var count = isMobile ? 5 : 8;
            for (var i = 0; i < count; i++) {
                var p = palettes[i % palettes.length];
                var size = isMobile ? 44 + Math.random() * 28 : 60 + Math.random() * 42;
                var x;
                var leftSide = Math.random() < 0.5;
                x = leftSide ? -20 + Math.random() * (vw * 0.3) : vw * 0.72 + Math.random() * (vw * 0.3);
                x = Math.max(8, Math.min(vw - size - 8, x));
                var y = Math.random() * Math.max(1, dh - size);

                var f = document.createElement("div");
                f.className = "flower";
                f.style.width = size + "px";
                f.style.height = size + "px";
                f.style.left = x + "px";
                f.style.top = y + "px";
                f.style.animationDuration = (4 + Math.random() * 4) + "s";
                f.style.animationDelay = (-Math.random() * 5) + "s";
                f.innerHTML = flowerSVG(5 + Math.floor(Math.random() * 3), p[0], p[1], p[2]);
                layer.appendChild(f);
            }
        }

        function setHeight() {
            layer.style.height = docHeight() + "px";
        }

        setHeight();
        spawn();
        window.addEventListener("load", setHeight);

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var els = layer.querySelectorAll(".flower");
                for (var i = 0; i < els.length; i++) els[i].remove();
                setHeight();
                spawn();
            }, 300);
        });
    }

    /* ---------- lightbox close ---------- */
    function initLightbox() {
        var lightbox = document.getElementById("lightbox");
        var close = document.getElementById("closeBtn");
        if (!lightbox) return;
        function hide() { lightbox.classList.remove("show"); }
        lightbox.addEventListener("click", hide);
        if (close) close.addEventListener("click", hide);
    }

    /* ---------- music ---------- */
    var startMusicFn = null;

    function initMusic() {
        var audio = document.getElementById("bgMusic");
        var btn = document.getElementById("musicBtn");
        var hint = document.getElementById("musicHint");
        if (!audio || !btn) return;

        function isPlaying() {
            return !audio.paused && !audio.ended;
        }

        function updateBtn() {
            if (isPlaying()) {
                btn.classList.remove("pulse");
                btn.classList.add("playing");
                btn.innerHTML = "&#127925;";
                btn.title = "Pause song";
            } else {
                btn.classList.remove("playing");
                btn.innerHTML = "&#127911;";
                btn.title = "Play song";
            }
            if (hint) hint.classList.remove("show");
        }

        btn.addEventListener("click", function () {
            if (isPlaying()) {
                audio.pause();
                if (hint) hint.classList.add("show");
            } else {
                audio.play();
            }
            updateBtn();
        });

        audio.addEventListener("play", updateBtn);
        audio.addEventListener("pause", function () {
            updateBtn();
            if (hint) hint.classList.add("show");
        });

        startMusicFn = function () {
            var p = audio.play();
            if (p && p.then) {
                p.then(updateBtn).catch(function () {
                    btn.classList.add("pulse");
                    if (hint) hint.classList.add("show");
                });
            }
        };
    }

    /* ---------- gift opening screen ---------- */
    function addFloatingHearts(screen) {
        var hearts = ["\uD83C\uDF88", "\u2764\uFE0F", "\uD83D\uDC9E", "\u2728", "\uD83C\uDF8A", "\uD83D\uDC99"];
        for (var i = 0; i < 10; i++) {
            var s = document.createElement("div");
            s.className = "float-heart";
            s.textContent = hearts[i % hearts.length];
            s.style.left = (6 + Math.random() * 88) + "%";
            s.style.top = (10 + Math.random() * 80) + "%";
            s.style.fontSize = (24 + Math.random() * 28) + "px";
            s.style.animationDuration = (4 + Math.random() * 4) + "s";
            s.style.animationDelay = (-Math.random() * 5) + "s";
            screen.appendChild(s);
        }
    }

    function startBurst(canvas, cx, cy) {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext("2d");
        var COLORS = ["#ffd166", "#ff5d8f", "#ff8fa3", "#ffb703", "#e63946", "#8338ec", "#06d6a0", "#4cc9f0", "#ffffff"];
        var EMOJIS = ["\u2764\uFE0F", "\uD83C\uDF89", "\uD83C\uDF82", "\uD83C\uDF88", "\u2728", "\uD83C\uDF8A", "\uD83D\uDC8E"];
        var parts = [];
        var count = window.innerWidth <= 760 ? 90 : 130;
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = 3 + Math.random() * 10;
            parts.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2.5,
                life: 0,
                maxLife: 45 + Math.random() * 45,
                size: 3 + Math.random() * 6,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                emoji: i % 4 === 0 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 0.3
            });
        }
        for (var r = 0; r < 3; r++) {
            parts.push({ x: cx, y: cy, vx: 0, vy: 0, life: 0, maxLife: 30, size: 8 + r * 22, color: "#fff", emoji: null, rot: 0, vr: 0, ring: true });
        }

        canvas.style.display = "block";

        function frame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var alive = false;
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                p.life++;
                if (p.life > p.maxLife) continue;
                alive = true;
                p.vy += 0.12;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.99;
                var alpha = 1 - p.life / p.maxLife;
                ctx.save();
                ctx.globalAlpha = alpha;
                if (p.ring) {
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, p.size + p.life * 3, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (p.emoji) {
                    ctx.font = (p.size * 2.6) + "px serif";
                    ctx.textAlign = "center";
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot + p.life * 0.04);
                    ctx.fillText(p.emoji, 0, 0);
                } else {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
                }
                ctx.restore();
            }
            if (alive) {
                requestAnimationFrame(frame);
            } else {
                canvas.style.display = "none";
            }
        }
        requestAnimationFrame(frame);
    }

    function initGift() {
        var screen = document.getElementById("giftScreen");
        var box = document.getElementById("giftBox");
        var burst = document.getElementById("burstCanvas");
        var mainDiv = document.getElementById("mainDiv");
        if (!screen || !box) return;

        addFloatingHearts(screen);

        var opened = false;
        function openGift() {
            if (opened) return;
            opened = true;

            var r = box.getBoundingClientRect();
            var cx = r.left + r.width / 2;
            var cy = r.top + r.height / 2;

            box.classList.add("opened");
            startBurst(burst, cx, cy);
            if (startMusicFn) startMusicFn();

            setTimeout(function () {
                screen.classList.add("reveal");
                if (mainDiv) mainDiv.classList.add("show");
                setTimeout(function () {
                    screen.style.display = "none";
                }, 900);
            }, 550);

            startContent();
        }

        box.addEventListener("click", function (e) {
            e.stopPropagation();
            openGift();
        });
        screen.addEventListener("click", openGift);
    }

    function startContent() {
        var codeEl = document.getElementById("code");
        if (codeEl) typewriter(codeEl, 45);
        startHeart();
    }

    /* ---------- boot ---------- */
    function boot() {
        startBubbles();
        startFlowers();
        startCountdown();
        initLightbox();
        initMusic();
        initGift();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
