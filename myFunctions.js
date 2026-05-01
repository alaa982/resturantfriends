/**
 * myFunctions.js
 * ملف JavaScript الموحد - جميع الوظائف اللازمة للموقع
 * مطعم الاصدقاء
 */

$(document).ready(function () {
    // تأثير ظهور العناصر عند التحميل
    $('.fade-in').each(function (i) {
        var el = $(this);
        setTimeout(function () {
            el.css({ opacity: 1 });
        }, i * 120);
    });
});

/* ========================================================
   وظائف صفحة الوجبات
   ======================================================== */

/**
 * إظهار / إخفاء تفاصيل الوجبة
 * @param {string} id - رمز الوجبة
 */
function toggleDetail(id) {
    var detailRow = $('#detail-' + id);
    var btn = $('[onclick="toggleDetail(\'' + id + '\')"]');

    if (detailRow.is(':visible')) {
        detailRow.hide();
        btn.text('عرض ▼');
    } else {
        detailRow.show().addClass('fade-in');
        btn.text('إخفاء ▲');
    }
}

/**
 * عرض نموذج الطلب عند الضغط على "متابعة"
 */
function showOrderForm() {
    var checked = $('.meal-check:checked');
    if (checked.length === 0) {
        alert('يرجى اختيار وجبة واحدة على الأقل قبل المتابعة!');
        return;
    }
    $('#orderForm').slideDown(400);
    $('html, body').animate({ scrollTop: $('#orderForm').offset().top - 20 }, 500);
}

/**
 * إلغاء الطلب وإخفاء النموذج
 */
function cancelOrder() {
    $('#orderForm').slideUp(300);
    resetForm();
}

/* ========================================================
   وظائف التحقق من المدخلات
   ======================================================== */

/**
 * التحقق من الاسم الكامل - أحرف عربية فقط
 * @param {string} val
 * @returns {boolean}
 */
function validateName(val) {
    if (val.trim() === '') return true; // اختياري
    var arabicOnly = /^[\u0600-\u06FF\s]+$/;
    return arabicOnly.test(val.trim());
}

/**
 * التحقق من الرقم الوطني السوري
 * 11 خانة - أول خانتين من 01 إلى 14
 * @param {string} val
 * @returns {boolean}
 */
function validateNationalId(val) {
    if (!/^\d{11}$/.test(val)) return false;
    var prefix = parseInt(val.substring(0, 2));
    var validPrefixes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    return validPrefixes.indexOf(prefix) !== -1;
}

/**
 * التحقق من تاريخ الميلاد
 * @param {string} val
 * @returns {boolean}
 */
function validateBirthDate(val) {
    if (val.trim() === '') return true; // اختياري
    var date = new Date(val);
    if (isNaN(date.getTime())) return false;
    var now = new Date();
    return date < now;
}

/**
 * التحقق من رقم الموبايل السوري
 * Syriatel: 094, 099, 093, 096
 * MTN: 098, 097, 011
 * @param {string} val
 * @returns {boolean}
 */
function validateMobile(val) {
    if (val.trim() === '') return true; // اختياري
    var syriatelPattern = /^09[34679]\d{7}$/;
    var mtnPattern    = /^(098|097|011)\d{7}$/;
    return syriatelPattern.test(val) || mtnPattern.test(val);
}

/**
 * التحقق من البريد الإلكتروني
 * @param {string} val
 * @returns {boolean}
 */
function validateEmail(val) {
    if (val.trim() === '') return true; // اختياري
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(val);
}

/**
 * تطبيق مظهر خطأ / صحيح على حقل
 */
function setFieldState(inputId, isValid, errId) {
    var $input = $('#' + inputId);
    var $err   = $('#' + errId);

    $input.removeClass('error valid');
    if (!isValid) {
        $input.addClass('error');
        $err.addClass('show');
    } else {
        $input.addClass('valid');
        $err.removeClass('show');
    }
    return isValid;
}

/* ========================================================
   إرسال الطلب
   ======================================================== */

/**
 * التحقق من جميع الحقول وعرض النافذة عند النجاح
 */
function submitOrder() {
    var allValid = true;

    // الاسم
    var nameVal = $('#fullName').val();
    if (!validateName(nameVal)) {
        setFieldState('fullName', false, 'err-fullName');
        allValid = false;
    } else {
        setFieldState('fullName', true, 'err-fullName');
    }

    // الرقم الوطني (إلزامي)
    var idVal = $('#nationalId').val();
    if (!validateNationalId(idVal)) {
        setFieldState('nationalId', false, 'err-nationalId');
        allValid = false;
    } else {
        setFieldState('nationalId', true, 'err-nationalId');
    }

    // تاريخ الميلاد
    var birthVal = $('#birthDate').val();
    if (!validateBirthDate(birthVal)) {
        setFieldState('birthDate', false, 'err-birthDate');
        allValid = false;
    } else {
        setFieldState('birthDate', true, 'err-birthDate');
    }

    // الموبايل
    var mobileVal = $('#mobile').val();
    if (!validateMobile(mobileVal)) {
        setFieldState('mobile', false, 'err-mobile');
        allValid = false;
    } else {
        setFieldState('mobile', true, 'err-mobile');
    }

    // الإيميل
    var emailVal = $('#email').val();
    if (!validateEmail(emailVal)) {
        setFieldState('email', false, 'err-email');
        allValid = false;
    } else {
        setFieldState('email', true, 'err-email');
    }

    if (!allValid) {
        return;
    }

    // جمع الوجبات المختارة
    var selectedMeals = [];
    var totalPrice = 0;

    $('.meal-check:checked').each(function () {
        var id    = $(this).data('id');
        var name  = $(this).data('name');
        var price = parseInt($(this).data('price'));
        selectedMeals.push({ id: id, name: name, price: price });
        totalPrice += price;
    });

    // حساب الضريبة 5%
    var tax     = totalPrice * 0.05;
    var finalTotal = totalPrice - tax;

    // بناء محتوى النافذة
    var html = '';

    // معلومات الزبون
    html += '<div class="modal-item">';
    html += '<h4>👤 معلومات مقدم الطلب</h4>';
    if (nameVal) html += '<p>الاسم: ' + nameVal + '</p>';
    html += '<p>الرقم الوطني: ' + idVal + '</p>';
    if (birthVal) html += '<p>تاريخ الميلاد: ' + birthVal + '</p>';
    if (mobileVal) html += '<p>الموبايل: ' + mobileVal + '</p>';
    if (emailVal) html += '<p>البريد: ' + emailVal + '</p>';
    html += '</div>';

    // الوجبات المختارة
    html += '<h4 style="margin:1rem 0 0.5rem; color:var(--primary-dark);">🍽️ الوجبات المطلوبة:</h4>';

    $.each(selectedMeals, function (i, meal) {
        html += '<div class="modal-item">';
        html += '<h4>' + meal.id + ' - ' + meal.name + '</h4>';
        html += '<p>السعر: ' + formatPrice(meal.price) + ' ل.س</p>';
        html += '</div>';
    });

    // المجموع
    html += '<div class="modal-total">';
    html += '<p>المجموع الفرعي: ' + formatPrice(totalPrice) + ' ل.س</p>';
    html += '<p>خصم الضريبة (5%): - ' + formatPrice(tax) + ' ل.س</p>';
    html += '<hr style="border-color:rgba(255,255,255,0.3);margin:0.5rem 0;">';
    html += '<p style="font-size:1.2rem; font-weight:bold;">المبلغ النهائي: ' + formatPrice(finalTotal) + ' ل.س</p>';
    html += '</div>';

    // عرض النافذة
    $('#modalContent').html(html);
    $('#resultModal').addClass('show');
}

/**
 * تنسيق الأرقام بالفاصلة
 */
function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * إغلاق النافذة
 */
function closeModal() {
    $('#resultModal').removeClass('show');
}

/**
 * إعادة تهيئة النموذج
 */
function resetForm() {
    $('#fullName, #nationalId, #birthDate, #mobile, #email').val('');
    $('input').removeClass('error valid');
    $('.error-msg').removeClass('show');
}

/* ========================================================
   أحداث jQuery - التحقق الفوري عند الكتابة
   ======================================================== */
$(document).ready(function () {

    // إغلاق النافذة عند الضغط خارجها
    $('#resultModal').on('click', function (e) {
        if ($(e.target).is('#resultModal')) {
            closeModal();
        }
    });

    // التحقق الفوري
    $('#fullName').on('input', function () {
        var v = $(this).val();
        if (v === '') {
            $(this).removeClass('error valid');
            $('#err-fullName').removeClass('show');
        } else {
            setFieldState('fullName', validateName(v), 'err-fullName');
        }
    });

    $('#nationalId').on('input', function () {
        $(this).val($(this).val().replace(/\D/g, ''));
        var v = $(this).val();
        if (v !== '') setFieldState('nationalId', validateNationalId(v), 'err-nationalId');
    });

    $('#birthDate').on('change', function () {
        setFieldState('birthDate', validateBirthDate($(this).val()), 'err-birthDate');
    });

    $('#mobile').on('input', function () {
        $(this).val($(this).val().replace(/\D/g, ''));
        var v = $(this).val();
        if (v !== '') setFieldState('mobile', validateMobile(v), 'err-mobile');
    });

    $('#email').on('input', function () {
        var v = $(this).val();
        if (v !== '') setFieldState('email', validateEmail(v), 'err-email');
    });

});
