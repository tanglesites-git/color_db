
/**
 * Simple matrix (and vector) multiplication
 * Warning: No error handling for incompatible dimensions!
 * @author Lea Verou 2020 MIT License
 */
// A is m x n. B is n x p. product is m x p.
function multiplyMatrices(A, B) {
	let m = A.length;

	if (!Array.isArray(A[0])) {
		// A is vector, convert to [[a, b, c, ...]]
		A = [A];
	}

	if (!Array.isArray(B[0])) {
		// B is vector, convert to [[a], [b], [c], ...]]
		B = B.map(x => [x]);
	}

	let p = B[0].length;
	let B_cols = B[0].map((_, i) => B.map(x => x[i])); // transpose B
	let product = A.map(row => B_cols.map(col => {
		if (!Array.isArray(row)) {
			return col.reduce((a, c) => a + c * row, 0);
		}

		return row.reduce((a, c, i) => a + c * (col[i] || 0), 0);
	}));

	if (m === 1) {
		product = product[0]; // Avoid [[a, b, c, ...]]
	}

	if (p === 1) {
		return product.map(x => x[0]); // Avoid [[a], [b], [c], ...]]
	}

	return product;
}

// Sample code for color conversions
// Conversion can also be done using ICC profiles and a Color Management System
// For clarity, a library is used for matrix multiplication (multiply-matrices.js)

// standard white points, defined by 4-figure CIE x,y chromaticities
const D50 = [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585];
const D65 = [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290];

// sRGB-related functions

function lin_sRGB(RGB) {
	// convert an array of sRGB values
	// where in-gamut values are in the range [0 - 1]
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	// Extended transfer function:
	// for negative values,  linear portion is extended on reflection of axis,
	// then reflected power function is used.
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs <= 0.04045) {
			return val / 12.92;
		}

		return sign * (Math.pow((abs + 0.055) / 1.055, 2.4));
	});
}

function gam_sRGB(RGB) {
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	// Extended transfer function:
	// For negative values, linear portion extends on reflection
	// of axis, then uses reflected pow below that
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs > 0.0031308) {
			return sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055);
		}

		return 12.92 * val;
	});
}

function lin_sRGB_to_XYZ(rgb) {
	// convert an array of linear-light sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)

	var M = [
		[ 506752 / 1228815,  87881 / 245763,   12673 /   70218 ],
		[  87098 /  409605, 175762 / 245763,   12673 /  175545 ],
		[   7918 /  409605,  87881 / 737289, 1001167 / 1053270 ],
	];
	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_sRGB(XYZ) {
	// convert XYZ to linear-light sRGB

	var M = [
		[   12831 /   3959,    -329 /    214, -1974 /   3959 ],
		[ -851781 / 878810, 1648619 / 878810, 36519 / 878810 ],
		[     705 /  12673,   -2585 /  12673,   705 /    667 ],
	];

	return multiplyMatrices(M, XYZ);
}

//  display-p3-related functions


function lin_P3(RGB) {
	// convert an array of display-p3 RGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.

	return lin_sRGB(RGB);	// same as sRGB
}

function gam_P3(RGB) {
	// convert an array of linear-light display-p3 RGB  in the range 0.0-1.0
	// to gamma corrected form

	return gam_sRGB(RGB);	// same as sRGB
}

function lin_P3_to_XYZ(rgb) {
	// convert an array of linear-light display-p3 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = [
		[ 608311 / 1250200, 189793 / 714400,  198249 / 1000160 ],
		[  35783 /  156275, 247089 / 357200,  198249 / 2500400 ],
		[      0 /       1,  32229 / 714400, 5220557 / 5000800 ],
	];

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_P3(XYZ) {
	// convert XYZ to linear-light P3
	var M = [
		[ 446124 / 178915, -333277 / 357830, -72051 / 178915 ],
		[ -14852 /  17905,   63121 /  35810,    423 /  17905 ],
		[  11844 / 330415,  -50337 / 660830, 316169 / 330415 ],
	];

	return multiplyMatrices(M, XYZ);
}

// prophoto-rgb functions

function lin_ProPhoto(RGB) {
	// convert an array of prophoto-rgb values
	// where in-gamut colors are in the range [0.0 - 1.0]
	// to linear light (un-companded) form.
	// Transfer curve is gamma 1.8 with a small linear portion
	// Extended transfer function
	const Et2 = 16/512;
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs <= Et2) {
			return val / 16;
		}

		return sign * Math.pow(abs, 1.8);
	});
}

function gam_ProPhoto(RGB) {
	// convert an array of linear-light prophoto-rgb  in the range 0.0-1.0
	// to gamma corrected form
	// Transfer curve is gamma 1.8 with a small linear portion
	// TODO for negative values, extend linear portion on reflection of axis, then add pow below that
	const Et = 1/512;
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs >= Et) {
			return sign * Math.pow(abs, 1/1.8);
		}

		return 16 * val;
	});
}

function lin_ProPhoto_to_XYZ(rgb) {
	// convert an array of linear-light prophoto-rgb values to CIE D50 XYZ
	// matrix cannot be expressed in rational form, but is calculated to 64 bit accuracy
	// see https://github.com/w3c/csswg-drafts/issues/7675
	var M = [
		[ 0.79776664490064230,  0.13518129740053308,  0.03134773412839220 ],
		[ 0.28807482881940130,  0.71183523424187300,  0.00008993693872564 ],
		[ 0.00000000000000000,  0.00000000000000000,  0.82510460251046020 ]
	];

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_ProPhoto(XYZ) {
	// convert D50 XYZ to linear-light prophoto-rgb
	var M = [
		[  1.34578688164715830, -0.25557208737979464, -0.05110186497554526 ],
        [ -0.54463070512490190,  1.50824774284514680,  0.02052744743642139 ],
        [  0.00000000000000000,  0.00000000000000000,  1.21196754563894520 ]
	];

	return multiplyMatrices(M, XYZ);
}

// a98-rgb functions

function lin_a98rgb(RGB) {
	// convert an array of a98-rgb values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// negative values are also now accepted
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

	  	return sign * Math.pow(abs, 563/256);
	});
}

function gam_a98rgb(RGB) {
	// convert an array of linear-light a98-rgb  in the range 0.0-1.0
	// to gamma corrected form
	// negative values are also now accepted
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		return sign * Math.pow(abs, 256/563);
	});
}

function lin_a98rgb_to_XYZ(rgb) {
	// convert an array of linear-light a98-rgb values to CIE XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// has greater numerical precision than section 4.3.5.3 of
	// https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
	// but the values below were calculated from first principles
	// from the chromaticity coordinates of R G B W
	// see matrixmaker.html
	var M = [
		[ 573536 /  994567,  263643 / 1420810,  187206 /  994567 ],
		[ 591459 / 1989134, 6239551 / 9945670,  374412 / 4972835 ],
		[  53769 / 1989134,  351524 / 4972835, 4929758 / 4972835 ],
	];

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_a98rgb(XYZ) {
	// convert XYZ to linear-light a98-rgb
	var M = [
		[ 1829569 /  896150, -506331 /  896150, -308931 /  896150 ],
		[ -851781 /  878810, 1648619 /  878810,   36519 /  878810 ],
		[   16779 / 1248040, -147721 / 1248040, 1266979 / 1248040 ],
	];

	return multiplyMatrices(M, XYZ);
}

//Rec. 2020-related functions

function lin_2020(RGB) {
	// convert an array of rec2020 RGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// ITU-R BT.2020-2 p.4

	const α = 1.09929682680944 ;
	const β = 0.018053968510807;

	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs < β * 4.5 ) {
			return val / 4.5;
		}

		return sign * (Math.pow((abs + α -1 ) / α, 1/0.45));
	});
}

function gam_2020(RGB) {
	// convert an array of linear-light rec2020 RGB  in the range 0.0-1.0
	// to gamma corrected form
	// ITU-R BT.2020-2 p.4

	const α = 1.09929682680944 ;
	const β = 0.018053968510807;


	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs > β ) {
			return sign * (α * Math.pow(abs, 0.45) - (α - 1));
		}

		return 4.5 * val;
	});
}

function lin_2020_to_XYZ(rgb) {
	// convert an array of linear-light rec2020 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = [
		[ 63426534 / 99577255,  20160776 / 139408157,  47086771 / 278816314 ],
		[ 26158966 / 99577255, 472592308 / 697040785,   8267143 / 139408157 ],
		[        0 /        1,  19567812 / 697040785, 295819943 / 278816314 ],
	];
	// 0 is actually calculated as  4.994106574466076e-17

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_2020(XYZ) {
	// convert XYZ to linear-light rec2020
	var M = [
		[  30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100 ],
		[ -19765991 / 29648200, 47925759 / 29648200,   467509 / 29648200 ],
		[    792561 / 44930125, -1921689 / 44930125, 42328811 / 44930125 ],
	];

	return multiplyMatrices(M, XYZ);
}

// Chromatic adaptation

function D65_to_D50(XYZ) {
	// Bradford chromatic adaptation from D65 to D50
	// The matrix below is the result of three operations:
	// - convert from XYZ to retinal cone domain
	// - scale components from one reference white to another
	// - convert back to XYZ
	// see https://github.com/LeaVerou/color.js/pull/354/files
	
	var M =  [
		[  1.0479297925449969,    0.022946870601609652,  -0.05019226628920524  ],
		[  0.02962780877005599,   0.9904344267538799,    -0.017073799063418826 ],
		[ -0.009243040646204504,  0.015055191490298152,   0.7518742814281371   ]
	];

	return multiplyMatrices(M, XYZ);
}

function D50_to_D65(XYZ) {
	// Bradford chromatic adaptation from D50 to D65
	// See https://github.com/LeaVerou/color.js/pull/360/files
	var M = [
		[  0.955473421488075,    -0.02309845494876471,   0.06325924320057072  ],
		[ -0.0283697093338637,    1.0099953980813041,    0.021041441191917323 ],
		[  0.012314014864481998, -0.020507649298898964,  1.330365926242124    ]
	];

	return multiplyMatrices(M, XYZ);
}

// CIE Lab and LCH

function XYZ_to_Lab(XYZ) {
	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	var ε = 216/24389;  // 6^3/29^3
	var κ = 24389/27;   // 29^3/3^3

	// compute xyz, which is XYZ scaled relative to reference white
	var xyz = XYZ.map((value, i) => value / D50[i]);

	// now compute f
	var f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);

	return [
		(116 * f[1]) - 16, 	 // L
		500 * (f[0] - f[1]), // a
		200 * (f[1] - f[2])  // b
	];
	// L in range [0,100]. For use in CSS, add a percent
}

function Lab_to_XYZ(Lab) {
	// Convert Lab to D50-adapted XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var κ = 24389/27;   // 29^3/3^3
	var ε = 216/24389;  // 6^3/29^3
	var f = [];

	// compute f, starting with the luminance-related term
	f[1] = (Lab[0] + 16)/116;
	f[0] = Lab[1]/500 + f[1];
	f[2] = f[1] - Lab[2]/200;

	// compute xyz
	var xyz = [
		Math.pow(f[0],3) > ε ?   Math.pow(f[0],3)            : (116*f[0]-16)/κ,
		Lab[0] > κ * ε ?         Math.pow((Lab[0]+16)/116,3) : Lab[0]/κ,
		Math.pow(f[2],3)  > ε ?  Math.pow(f[2],3)            : (116*f[2]-16)/κ
	];

	// Compute XYZ by scaling xyz by reference white
	return xyz.map((value, i) => value * D50[i]);
}

function Lab_to_LCH(Lab) {
	// Convert to polar form
	var hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;
	return [
		Lab[0], // L is still L
		Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)), // Chroma
		hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
	];
}

function LCH_to_Lab(LCH) {
	// Convert from polar form
	return [
		LCH[0], // L is still L
		LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
		LCH[1] * Math.sin(LCH[2] * Math.PI / 180) // b
	];
}

// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
// recalculated for 64bit precision
// see https://github.com/color-js/color.js/pull/357

function XYZ_to_OKLab(XYZ) {
	// Given XYZ relative to D65, convert to OKLab
	var XYZtoLMS = [
		[ 0.8190224379967030, 0.3619062600528904, -0.1288737815209879 ],
		[ 0.0329836539323885, 0.9292868615863434,  0.0361446663506424 ],
		[ 0.0481771893596242, 0.2642395317527308,  0.6335478284694309 ]
	];
	var LMStoOKLab = [
		[ 0.2104542683093140,  0.7936177747023054, -0.0040720430116193 ],
		[ 1.9779985324311684, -2.4285922420485799,  0.4505937096174110 ],
		[ 0.0259040424655478,  0.7827717124575296, -0.8086757549230774 ]
	];

	var LMS = multiplyMatrices(XYZtoLMS, XYZ);
	// JavaScript Math.cbrt returns a sign-matched cube root
	// beware if porting to other languages
	// especially if tempted to use a general power function
	return multiplyMatrices(LMStoOKLab, LMS.map(c => Math.cbrt(c)));
	// L in range [0,1]. For use in CSS, multiply by 100 and add a percent
}

function OKLab_to_XYZ(OKLab) {
	// Given OKLab, convert to XYZ relative to D65
	var LMStoXYZ =  [
		[  1.2268798758459243, -0.5578149944602171,  0.2813910456659647 ],
		[ -0.0405757452148008,  1.1122868032803170, -0.0717110580655164 ],
		[ -0.0763729366746601, -0.4214933324022432,  1.5869240198367816 ]
	];
	var OKLabtoLMS = [
		[ 1.0000000000000000,  0.3963377773761749,  0.2158037573099136 ],
		[ 1.0000000000000000, -0.1055613458156586, -0.0638541728258133 ],
		[ 1.0000000000000000, -0.0894841775298119, -1.2914855480194092 ]
    ];

	var LMSnl = multiplyMatrices(OKLabtoLMS, OKLab);
	return multiplyMatrices(LMStoXYZ, LMSnl.map(c => c ** 3));
}

function OKLab_to_OKLCH(OKLab) {
	var hue = Math.atan2(OKLab[2], OKLab[1]) * 180 / Math.PI;
	return [
		OKLab[0], // L is still L
		Math.sqrt(OKLab[1] ** 2 + OKLab[2] ** 2), // Chroma
		hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
	];
}

function OKLCH_to_OKLab(OKLCH) {
	return [
		OKLCH[0], // L is still L
		OKLCH[1] * Math.cos(OKLCH[2] * Math.PI / 180), // a
		OKLCH[1] * Math.sin(OKLCH[2] * Math.PI / 180)  // b
	];
}

// Premultiplied alpha conversions

function rectangular_premultiply(color, alpha) {
// given a color in a rectangular orthogonal colorspace
// and an alpha value
// return the premultiplied form
	return color.map((c) => c * alpha)
}

function rectangular_un_premultiply(color, alpha) {
// given a premultiplied color in a rectangular orthogonal colorspace
// and an alpha value
// return the actual color
	if (alpha === 0) {
		return color; // avoid divide by zero
	}
	return color.map((c) => c / alpha)
}

function polar_premultiply(color, alpha, hueIndex) {
	// given a color in a cylindicalpolar colorspace
	// and an alpha value
	// return the premultiplied form.
	// the index says which entry in the color array corresponds to hue angle
	// for example, in OKLCH it would be 2
	// while in HSL it would be 0
	return color.map((c, i) => c * (hueIndex === i? 1 : alpha))
}

function polar_un_premultiply(color, alpha, hueIndex) {
	// given a color in a cylindicalpolar colorspace
	// and an alpha value
	// return the actual color.
	// the hueIndex says which entry in the color array corresponds to hue angle
	// for example, in OKLCH it would be 2
	// while in HSL it would be 0
	if (alpha === 0) {
		return color; // avoid divide by zero
	}
	return color.map((c, i) => c / (hueIndex === i? 1 : alpha))
}

// Convenience functions can easily be defined, such as
function hsl_premultiply(color, alpha) {
	return polar_premultiply(color, alpha, 0);
}

//////////////////////////////////////////////////////////////////////////////////
//  							18.1. ΔE2000
// The simplest color difference metric, ΔE76, is simply the Euclidean distance in Lab color space. While this is a good first approximation, color-critical industries such as printing and fabric dyeing soon developed improved formulae. Currently, the most widely used formula is ΔE2000. It corrects a number of known asymmetries and non-linearities compared to ΔE76. Because the formula is complex, and critically dependent on the sign of various intermediate calculations, implementations are often incorrect [Sharma].

// The sample code below has been validated to five significant figures against the test suite of paired Lab values and expected ΔE2000 published by [Sharma] and is correct.
//////////////////////////////////////////////////////////////////////////////////

// deltaE2000 is a statistically significant improvement
// over deltaE76 and deltaE94,
// and is recommended by the CIE and Idealliance
// especially for color differences less than 10 deltaE76
// but is wicked complicated
// and many implementations have small errors!

/**
 * @param {number[]} reference - Array of CIE Lab values: L as 0..100, a and b as around -150..150
 * @param {number[]} sample - Array of CIE Lab values: L as 0..100, a and b as around -150..150
 * @return {number} How different a color sample is from reference
 */

function deltaE2000 (reference, sample) {

    // Given a reference and a sample color,
    // both in CIE Lab,
    // calculate deltaE 2000.

    // This implementation assumes the parametric
    // weighting factors kL, kC and kH
    // (for the influence of viewing conditions)
    // are all 1, as seems typical.

    let [L1, a1, b1] = reference;
    let [L2, a2, b2] = sample;
    let C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
    let C2 = Math.sqrt(a2 ** 2 + b2 ** 2);

	let Cbar = (C1 + C2)/2; // mean Chroma

	// calculate a-axis asymmetry factor from mean Chroma
	// this turns JND ellipses for near-neutral colors back into circles
	let C7 = Math.pow(Cbar, 7);
	const Gfactor = Math.pow(25, 7);
	let G = 0.5 * (1 - Math.sqrt(C7/(C7+Gfactor)));

	// scale a axes by asymmetry factor
	// this by the way is why there is no Lab2000 color space
	let adash1 = (1 + G) * a1;
	let adash2 = (1 + G) * a2;

	// calculate new Chroma from scaled a and original b axes
	let Cdash1 = Math.sqrt(adash1 ** 2 + b1 ** 2);
	let Cdash2 = Math.sqrt(adash2 ** 2 + b2 ** 2);

	// calculate new hues, with zero hue for true neutrals
	// and in degrees, not radians
	const π = Math.PI;
	const r2d = 180 / π;
	const d2r = π / 180;
	let h1 = (adash1 === 0 && b1 === 0)? 0: Math.atan2(b1, adash1);
	let h2 = (adash2 === 0 && b2 === 0)? 0: Math.atan2(b2, adash2);

	if (h1 < 0) {
		h1 += 2 * π;
	}
	if (h2 < 0) {
		h2 += 2 * π;
	}

	h1 *= r2d;
	h2 *= r2d;

	// Lightness and Chroma differences; sign matters
	let ΔL = L2 - L1;
	let ΔC = Cdash2 - Cdash1;

	// Hue difference, taking care to get the sign correct
	let hdiff = h2 - h1;
	let hsum = h1 + h2;
	let habs = Math.abs(hdiff);
	let Δh;

	if (Cdash1 * Cdash2 === 0) {
		Δh = 0;
	}
	else if (habs <= 180) {
		Δh = hdiff;
	}
	else if (hdiff > 180) {
		Δh = hdiff - 360;
	}
	else if (hdiff < -180) {
		Δh = hdiff + 360;
	}
	else {
		console.log("the unthinkable has happened");
	}

	// weighted Hue difference, more for larger Chroma
	let ΔH = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin(Δh * d2r / 2);

	// calculate mean Lightness and Chroma
	let Ldash = (L1 + L2)/2;
	let Cdash = (Cdash1 + Cdash2)/2;
	let Cdash7 = Math.pow(Cdash, 7);

	// Compensate for non-linearity in the blue region of Lab.
	// Four possibilities for hue weighting factor,
	// depending on the angles, to get the correct sign
	let hdash;
	if (Cdash1 == 0 && Cdash2 == 0) {
		hdash = hsum;   // which should be zero
	}
	else if (habs <= 180) {
		hdash = hsum / 2;
	}
	else if (hsum < 360) {
		hdash = (hsum + 360) / 2;
	}
	else {
		hdash = (hsum - 360) / 2;
	}

	// positional corrections to the lack of uniformity of CIELAB
	// These are all trying to make JND ellipsoids more like spheres

	// SL Lightness crispening factor
	// a background with L=50 is assumed
	let lsq = (Ldash - 50) ** 2;
	let SL = 1 + ((0.015 * lsq) / Math.sqrt(20 + lsq));

	// SC Chroma factor, similar to those in CMC and deltaE 94 formulae
	let SC = 1 + 0.045 * Cdash;

	// Cross term T for blue non-linearity
	let T = 1;
	T -= (0.17 * Math.cos((     hdash - 30)  * d2r));
	T += (0.24 * Math.cos(  2 * hdash        * d2r));
	T += (0.32 * Math.cos(((3 * hdash) + 6)  * d2r));
	T -= (0.20 * Math.cos(((4 * hdash) - 63) * d2r));

	// SH Hue factor depends on Chroma,
	// as well as adjusted hue angle like deltaE94.
	let SH = 1 + 0.015 * Cdash * T;

	// RT Hue rotation term compensates for rotation of JND ellipses
	// and Munsell constant hue lines
	// in the medium-high Chroma blue region
	// (Hue 225 to 315)
	let Δθ = 30 * Math.exp(-1 * (((hdash - 275)/25) ** 2));
	let RC = 2 * Math.sqrt(Cdash7/(Cdash7 + Gfactor));
	let RT = -1 * Math.sin(2 * Δθ * d2r) * RC;

	// Finally calculate the deltaE, term by term as root sum of squares
	let dE = (ΔL / SL) ** 2;
	dE += (ΔC / SC) ** 2;
	dE += (ΔH / SH) ** 2;
	dE += RT * (ΔC / SC) * (ΔH / SH);
	return Math.sqrt(dE);
	// Yay!!!
};


////////////////////////////////////////////////////////////////////////////////
// 							18.2. ΔEOK
// Because Oklab does not suffer from the hue linearity, hue uniformity, and chroma non-linearities of CIE Lab, the color difference metric does not need to correct for them and so is simply the Euclidean distance in Oklab color space.
////////////////////////////////////////////////////////////////////////////////


// Calculate deltaE OK
// simple root sum of squares
/**
 * @param {number[]} reference - Array of OKLab values: L as 0..1, a and b as -1..1
 * @param {number[]} sample - Array of OKLab values: L as 0..1, a and b as -1..1
 * @return {number} How different a color sample is from reference
 */
function deltaEOK (reference, sample) {
    let [L1, a1, b1] = reference;
	let [L2, a2, b2] = sample;
	let ΔL = L1 - L2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
}