const timeZone = 7;

const heavenlyStems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const earthlyBranches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function jdFromDate(day: number, month: number, year: number) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    if (jd < 2299161) {
        jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }

    return jd;
}

function newMoon(k: number) {
    const t = k / 1236.85;
    const t2 = t * t;
    const t3 = t2 * t;
    const dr = Math.PI / 180;
    let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
    jd += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
    const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
    const mpr = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
    const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
    let correction = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
    correction -= 0.4068 * Math.sin(mpr * dr);
    correction += 0.0161 * Math.sin(2 * dr * mpr);
    correction -= 0.0004 * Math.sin(3 * dr * mpr);
    correction += 0.0104 * Math.sin(2 * dr * f);
    correction -= 0.0051 * Math.sin((m + mpr) * dr);
    correction -= 0.0074 * Math.sin((m - mpr) * dr);
    correction += 0.0004 * Math.sin((2 * f + m) * dr);
    correction -= 0.0004 * Math.sin((2 * f - m) * dr);
    correction -= 0.0006 * Math.sin((2 * f + mpr) * dr);
    correction += 0.0010 * Math.sin((2 * f - mpr) * dr);
    correction += 0.0005 * Math.sin((2 * mpr + m) * dr);

    const deltaT = t < -11
        ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
        : -0.000278 + 0.000265 * t + 0.000262 * t2;

    return jd + correction - deltaT;
}

function getNewMoonDay(k: number) {
    return Math.floor(newMoon(k) + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number) {
    const t = (jdn - 2451545.5 - timeZone / 24) / 36525;
    const t2 = t * t;
    const dr = Math.PI / 180;
    const m = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t2 * t;
    const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
    let dl = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
    dl += (0.019993 - 0.000101 * t) * Math.sin(2 * dr * m) + 0.000290 * Math.sin(3 * dr * m);
    let l = l0 + dl;
    l -= 360 * Math.floor(l / 360);

    return Math.floor(l / 30);
}

function getLunarMonth11(year: number) {
    const off = jdFromDate(31, 12, year) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k);

    if (getSunLongitude(nm) >= 9) {
        nm = getNewMoonDay(k - 1);
    }

    return nm;
}

function getLeapMonthOffset(a11: number) {
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i));

    do {
        last = arc;
        i += 1;
        arc = getSunLongitude(getNewMoonDay(k + i));
    } while (arc !== last && i < 14);

    return i - 1;
}

function parseSolarDate(dateValue: string) {
    const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00+07:00`);

    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        return null;
    }

    return { day, month, year };
}

function convertSolarToLunar(day: number, month: number, year: number) {
    const dayNumber = jdFromDate(day, month, year);
    const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1);

    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k);
    }

    let a11 = getLunarMonth11(year);
    let b11 = a11;
    let lunarYear = year;

    if (a11 >= monthStart) {
        a11 = getLunarMonth11(year - 1);
    } else {
        lunarYear = year + 1;
        b11 = getLunarMonth11(year + 1);
    }

    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = false;
    let lunarMonth = diff + 11;

    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11);

        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;

            if (diff === leapMonthDiff) {
                lunarLeap = true;
            }
        }
    }

    if (lunarMonth > 12) {
        lunarMonth -= 12;
    }

    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }

    return { lunarDay, lunarMonth, lunarYear, lunarLeap };
}

function getSexagenaryYear(year: number) {
    return `${heavenlyStems[(year + 6) % 10]} ${earthlyBranches[(year + 8) % 12]}`;
}

export function formatVietnameseLunarDate(dateValue: string, fallback = '') {
    const solarDate = parseSolarDate(dateValue);

    if (!solarDate) {
        return fallback;
    }

    const lunarDate = convertSolarToLunar(solarDate.day, solarDate.month, solarDate.year);
    const day = String(lunarDate.lunarDay).padStart(2, '0');
    const month = String(lunarDate.lunarMonth).padStart(2, '0');
    const leap = lunarDate.lunarLeap ? ' nhuận' : '';

    return `Tức ngày ${day} tháng ${month}${leap} năm ${getSexagenaryYear(lunarDate.lunarYear)}`;
}
