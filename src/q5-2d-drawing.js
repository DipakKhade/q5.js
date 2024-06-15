Q5.modules.q2d_drawing = ($) => {
	$.CHORD = 0;
	$.PIE = 1;
	$.OPEN = 2;

	$.RADIUS = 'radius';
	$.CORNER = 'corner';
	$.CORNERS = 'corners';

	$.ROUND = 'round';
	$.SQUARE = 'butt';
	$.PROJECT = 'square';
	$.MITER = 'miter';
	$.BEVEL = 'bevel';

	$.CLOSE = 1;

	$.CENTER = 'center';
	$.LEFT = 'left';
	$.RIGHT = 'right';
	$.TOP = 'top';
	$.BOTTOM = 'bottom';

	$.LANDSCAPE = 'landscape';
	$.PORTRAIT = 'portrait';

	$.BLEND = 'source-over';
	$.REMOVE = 'destination-out';
	$.ADD = 'lighter';
	$.DARKEST = 'darken';
	$.LIGHTEST = 'lighten';
	$.DIFFERENCE = 'difference';
	$.SUBTRACT = 'subtract';
	$.EXCLUSION = 'exclusion';
	$.MULTIPLY = 'multiply';
	$.SCREEN = 'screen';
	$.REPLACE = 'copy';
	$.OVERLAY = 'overlay';
	$.HARD_LIGHT = 'hard-light';
	$.SOFT_LIGHT = 'soft-light';
	$.DODGE = 'color-dodge';
	$.BURN = 'color-burn';

	$._doStroke = true;
	$._doFill = true;
	$._strokeSet = false;
	$._fillSet = false;
	$._ellipseMode = $.CENTER;
	$._rectMode = $.CORNER;
	$._curveDetail = 20;
	$._curveAlpha = 0.0;

	let firstVertex = true;
	let curveBuff = [];

	function ink() {
		if ($._doFill) $.ctx.fill();
		if ($._doStroke) $.ctx.stroke();
	}

	// DRAWING SETTINGS

	$.strokeWeight = (n) => {
		if (!n) $._doStroke = false;
		if ($._da) n *= $._da;
		$.ctx.lineWidth = n || 0.0001;
	};
	$.stroke = function (c) {
		$._doStroke = true;
		$._strokeSet = true;
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._basicColors[c]) c = $.color(...$._basicColors[c]);
			if (c.a <= 0) return ($._doStroke = false);
		}
		$.ctx.strokeStyle = c.toString();
	};
	$.noStroke = () => ($._doStroke = false);
	$.fill = function (c) {
		$._doFill = true;
		$._fillSet = true;
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._basicColors[c]) c = $.color(...$._basicColors[c]);
			if (c.a <= 0) return ($._doFill = false);
		}
		$.ctx.fillStyle = c.toString();
	};
	$.noFill = () => ($._doFill = false);
	$.blendMode = (x) => ($.ctx.globalCompositeOperation = x);
	$.strokeCap = (x) => ($.ctx.lineCap = x);
	$.strokeJoin = (x) => ($.ctx.lineJoin = x);
	$.ellipseMode = (x) => ($._ellipseMode = x);
	$.rectMode = (x) => ($._rectMode = x);
	$.curveDetail = (x) => ($._curveDetail = x);
	$.curveAlpha = (x) => ($._curveAlpha = x);
	$.curveTightness = (x) => ($._curveAlpha = x);

	// DRAWING

	$.clear = () => {
		$.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
	};

	$.background = function (c) {
		if (c.canvas) return $.image(c, 0, 0, $.width, $.height);
		$.ctx.save();
		$.ctx.resetTransform();
		if (Q5.Color) {
			if (!c._q5Color && typeof c != 'string') c = $.color(...arguments);
			else if ($._basicColors[c]) c = $.color(...$._basicColors[c]);
		}
		$.ctx.fillStyle = c.toString();
		$.ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
		$.ctx.restore();
	};

	$.line = (x0, y0, x1, y1) => {
		if ($._doStroke) {
			if ($._da) {
				x0 *= $._da;
				y0 *= $._da;
				x1 *= $._da;
				y1 *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.moveTo(x0, y0);
			$.ctx.lineTo(x1, y1);
			$.ctx.stroke();
		}
	};

	function normAng(x) {
		let full = $._angleMode == $.DEGREES ? 360 : $.TAU;
		x = x % full;
		if (x < 0) x += full;
		return x;
	}

	function arc(x, y, w, h, start, stop, mode, detail) {
		if (!$._doFill && !$._doStroke) return;
		let lo = normAng(start);
		let hi = normAng(stop);
		if (lo > hi) [lo, hi] = [hi, lo];
		if (lo == 0 && hi == 0) return;
		$.ctx.beginPath();
		if (w == h) {
			$.ctx.arc(x, y, w / 2, lo, hi);
		} else {
			for (let i = 0; i < detail + 1; i++) {
				let t = i / detail;
				let a = $.lerp(lo, hi, t);
				let dx = ($.cos(a) * w) / 2;
				let dy = ($.sin(a) * h) / 2;
				$.ctx[i ? 'lineTo' : 'moveTo'](x + dx, y + dy);
			}
			if (mode == $.CHORD) {
				$.ctx.closePath();
			} else if (mode == $.PIE) {
				$.ctx.lineTo(x, y);
				$.ctx.closePath();
			}
		}
		ink();
	}
	$.arc = (x, y, w, h, start, stop, mode, detail = 25) => {
		if (start == stop) return $.ellipse(x, y, w, h);
		mode ??= $.PIE;
		if ($._ellipseMode == $.CENTER) {
			arc(x, y, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.RADIUS) {
			arc(x, y, w * 2, h * 2, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNER) {
			arc(x + w / 2, y + h / 2, w, h, start, stop, mode, detail);
		} else if ($._ellipseMode == $.CORNERS) {
			arc((x + w) / 2, (y + h) / 2, w - x, h - y, start, stop, mode, detail);
		}
	};

	function ellipse(x, y, w, h) {
		if (!$._doFill && !$._doStroke) return;
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		$.ctx.beginPath();
		$.ctx.ellipse(x, y, w / 2, h / 2, 0, 0, $.TAU);
		ink();
	}
	$.ellipse = (x, y, w, h) => {
		h ??= w;
		if ($._ellipseMode == $.CENTER) {
			ellipse(x, y, w, h);
		} else if ($._ellipseMode == $.RADIUS) {
			ellipse(x, y, w * 2, h * 2);
		} else if ($._ellipseMode == $.CORNER) {
			ellipse(x + w / 2, y + h / 2, w, h);
		} else if ($._ellipseMode == $.CORNERS) {
			ellipse((x + w) / 2, (y + h) / 2, w - x, h - y);
		}
	};
	$.circle = (x, y, d) => {
		if ($._ellipseMode == $.CENTER) {
			if ($._da) {
				x *= $._da;
				y *= $._da;
				d *= $._da;
			}
			$.ctx.beginPath();
			$.ctx.arc(x, y, d / 2, 0, $.TAU);
			ink();
		} else $.ellipse(x, y, d, d);
	};
	$.point = (x, y) => {
		if (x.x) {
			y = x.y;
			x = x.x;
		}
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		$.ctx.save();
		$.ctx.beginPath();
		$.ctx.arc(x, y, $.ctx.lineWidth / 2, 0, $.TAU);
		$.ctx.fillStyle = $.ctx.strokeStyle;
		$.ctx.fill();
		$.ctx.restore();
	};
	function rect(x, y, w, h) {
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
		}
		if ($._doFill) $.ctx.fillRect(x, y, w, h);
		if ($._doStroke) $.ctx.strokeRect(x, y, w, h);
	}
	function roundedRect(x, y, w, h, tl, tr, br, bl) {
		if (!$._doFill && !$._doStroke) return;
		if (tl === undefined) {
			return rect(x, y, w, h);
		}
		if (tr === undefined) {
			return roundedRect(x, y, w, h, tl, tl, tl, tl);
		}
		if ($._da) {
			x *= $._da;
			y *= $._da;
			w *= $._da;
			h *= $._da;
			tl *= $._da;
			tr *= $._da;
			bl *= $._da;
			br *= $._da;
		}
		const hh = Math.min(Math.abs(h), Math.abs(w)) / 2;
		tl = Math.min(hh, tl);
		tr = Math.min(hh, tr);
		bl = Math.min(hh, bl);
		br = Math.min(hh, br);
		$.ctx.beginPath();
		$.ctx.moveTo(x + tl, y);
		$.ctx.arcTo(x + w, y, x + w, y + h, tr);
		$.ctx.arcTo(x + w, y + h, x, y + h, br);
		$.ctx.arcTo(x, y + h, x, y, bl);
		$.ctx.arcTo(x, y, x + w, y, tl);
		$.ctx.closePath();
		ink();
	}

	$.rect = (x, y, w, h=w, tl, tr, br, bl) => {
		if ($._rectMode == $.CENTER) {
			roundedRect(x - w / 2, y - h / 2, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.RADIUS) {
			roundedRect(x - w, y - h, w * 2, h * 2, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNER) {
			roundedRect(x, y, w, h, tl, tr, br, bl);
		} else if ($._rectMode == $.CORNERS) {
			roundedRect(x, y, w - x, h - y, tl, tr, br, bl);
		}
	};
	$.square = (x, y, s, tl, tr, br, bl) => {
		return $.rect(x, y, s, s, tl, tr, br, bl);
	};

	function clearBuff() {
		curveBuff = [];
	}

	$.beginShape = () => {
		clearBuff();
		$.ctx.beginPath();
		firstVertex = true;
	};
	$.beginContour = () => {
		$.ctx.closePath();
		clearBuff();
		firstVertex = true;
	};
	$.endContour = () => {
		clearBuff();
		firstVertex = true;
	};
	$.vertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		clearBuff();
		if (firstVertex) {
			$.ctx.moveTo(x, y);
		} else {
			$.ctx.lineTo(x, y);
		}
		firstVertex = false;
	};
	$.bezierVertex = (cp1x, cp1y, cp2x, cp2y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			cp2x *= $._da;
			cp2y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		clearBuff();
		$.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};
	$.quadraticVertex = (cp1x, cp1y, x, y) => {
		if ($._da) {
			cp1x *= $._da;
			cp1y *= $._da;
			x *= $._da;
			y *= $._da;
		}
		clearBuff();
		$.ctx.quadraticCurveTo(cp1x, cp1y, x, y);
	};
	$.bezier = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.bezierVertex(x2, y2, x3, y3, x4, y4);
		$.endShape();
	};
	$.triangle = (x1, y1, x2, y2, x3, y3) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.endShape($.CLOSE);
	};
	$.quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.vertex(x1, y1);
		$.vertex(x2, y2);
		$.vertex(x3, y3);
		$.vertex(x4, y4);
		$.endShape($.CLOSE);
	};
	$.endShape = (close) => {
		clearBuff();
		if (close) $.ctx.closePath();
		ink();
	};
	function catmullRomSpline(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, numPts, alpha) {
		function catmullromSplineGetT(t, p0x, p0y, p1x, p1y, alpha) {
			let a = Math.pow(p1x - p0x, 2.0) + Math.pow(p1y - p0y, 2.0);
			let b = Math.pow(a, alpha * 0.5);
			return b + t;
		}
		let pts = [];

		let t0 = 0.0;
		let t1 = catmullromSplineGetT(t0, p0x, p0y, p1x, p1y, alpha);
		let t2 = catmullromSplineGetT(t1, p1x, p1y, p2x, p2y, alpha);
		let t3 = catmullromSplineGetT(t2, p2x, p2y, p3x, p3y, alpha);

		for (let i = 0; i < numPts; i++) {
			let t = t1 + (i / (numPts - 1)) * (t2 - t1);
			let s = [
				(t1 - t) / (t1 - t0),
				(t - t0) / (t1 - t0),
				(t2 - t) / (t2 - t1),
				(t - t1) / (t2 - t1),
				(t3 - t) / (t3 - t2),
				(t - t2) / (t3 - t2),
				(t2 - t) / (t2 - t0),
				(t - t0) / (t2 - t0),
				(t3 - t) / (t3 - t1),
				(t - t1) / (t3 - t1)
			];
			for (let j = 0; j < s.length; j += 2) {
				if (isNaN(s[j])) {
					s[j] = 1;
					s[j + 1] = 0;
				}
				if (!isFinite(s[j])) {
					if (s[j] > 0) {
						s[j] = 1;
						s[j + 1] = 0;
					} else {
						s[j] = 0;
						s[j + 1] = 1;
					}
				}
			}
			let a1x = p0x * s[0] + p1x * s[1];
			let a1y = p0y * s[0] + p1y * s[1];
			let a2x = p1x * s[2] + p2x * s[3];
			let a2y = p1y * s[2] + p2y * s[3];
			let a3x = p2x * s[4] + p3x * s[5];
			let a3y = p2y * s[4] + p3y * s[5];
			let b1x = a1x * s[6] + a2x * s[7];
			let b1y = a1y * s[6] + a2y * s[7];
			let b2x = a2x * s[8] + a3x * s[9];
			let b2y = a2y * s[8] + a3y * s[9];
			let cx = b1x * s[2] + b2x * s[3];
			let cy = b1y * s[2] + b2y * s[3];
			pts.push([cx, cy]);
		}
		return pts;
	}

	$.curveVertex = (x, y) => {
		if ($._da) {
			x *= $._da;
			y *= $._da;
		}
		curveBuff.push([x, y]);
		if (curveBuff.length < 4) return;
		let p0 = curveBuff.at(-4);
		let p1 = curveBuff.at(-3);
		let p2 = curveBuff.at(-2);
		let p3 = curveBuff.at(-1);
		let pts = catmullRomSpline(...p0, ...p1, ...p2, ...p3, $._curveDetail, $._curveAlpha);
		for (let i = 0; i < pts.length; i++) {
			if (firstVertex) {
				$.ctx.moveTo(...pts[i]);
			} else {
				$.ctx.lineTo(...pts[i]);
			}
			firstVertex = false;
		}
	};
	$.curve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		$.beginShape();
		$.curveVertex(x1, y1);
		$.curveVertex(x2, y2);
		$.curveVertex(x3, y3);
		$.curveVertex(x4, y4);
		$.endShape();
	};
	$.curvePoint = (a, b, c, d, t) => {
		const t3 = t * t * t,
			t2 = t * t,
			f1 = -0.5 * t3 + t2 - 0.5 * t,
			f2 = 1.5 * t3 - 2.5 * t2 + 1.0,
			f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t,
			f4 = 0.5 * t3 - 0.5 * t2;
		return a * f1 + b * f2 + c * f3 + d * f4;
	};
	$.bezierPoint = (a, b, c, d, t) => {
		const adjustedT = 1 - t;
		return (
			Math.pow(adjustedT, 3) * a +
			3 * Math.pow(adjustedT, 2) * t * b +
			3 * adjustedT * Math.pow(t, 2) * c +
			Math.pow(t, 3) * d
		);
	};
	$.curveTangent = (a, b, c, d, t) => {
		const t2 = t * t,
			f1 = (-3 * t2) / 2 + 2 * t - 0.5,
			f2 = (9 * t2) / 2 - 5 * t,
			f3 = (-9 * t2) / 2 + 4 * t + 0.5,
			f4 = (3 * t2) / 2 - t;
		return a * f1 + b * f2 + c * f3 + d * f4;
	};
	$.bezierTangent = (a, b, c, d, t) => {
		const adjustedT = 1 - t;
		return (
			3 * d * Math.pow(t, 2) -
			3 * c * Math.pow(t, 2) +
			6 * c * adjustedT * t -
			6 * b * adjustedT * t +
			3 * b * Math.pow(adjustedT, 2) -
			3 * a * Math.pow(adjustedT, 2)
		);
	};

	$.erase = function (fillAlpha = 255, strokeAlpha = 255) {
		$.ctx.save();
		$.ctx.globalCompositeOperation = 'destination-out';
		$.ctx.fillStyle = `rgba(0, 0, 0, ${fillAlpha / 255})`;
		$.ctx.strokeStyle = `rgba(0, 0, 0, ${strokeAlpha / 255})`;
	};

	$.noErase = function () {
		$.ctx.globalCompositeOperation = 'source-over';
		$.ctx.restore();
	};
};
