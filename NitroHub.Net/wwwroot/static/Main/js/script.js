function cooldown(){
     setTimeout(function(){
         $(".btn").prop("disabled", true);
     }, 100);
    
     setTimeout(function(){
         $(".btn").prop("disabled", false);
     }, 400);
}

function Copy(containerid) {
	let textarea = document.createElement('textarea');
	textarea.id = 'temp';
	textarea.style.height = 0;
	document.body.appendChild(textarea);
	textarea.value = document.getElementById(containerid).innerText;
	let selector = document.querySelector('#temp');
	selector.select();
	document.execCommand('copy');
	document.body.removeChild(textarea);
}

function getBalance() {
  const div = document.getElementById("getBalance");
  const div1 = document.getElementById("balanceModal");

  $.ajax({
    type: "POST",
    url: "/getBalance",
    success: function(data) {
      div.innerHTML = data;
      div1.innerHTML = data;
    },
    error: function() {
      div.innerHTML = "???";
      div1.innerHTML = "???";
    }
  });
}


app.payments = {
	'item': {},
	'last_timeout': 3111,
	'price_timeout': undefined,
	'submit': undefined,
	'changeMethodPrice': function(){
		$('#methodform .methods > li > .btn').each(function(){
			var that = $(this);

			var commission = that.find('.commission');

			var amount = parseFloat(that.attr('data-commission'));

			if(isNaN(amount)){
				amount = 0;
			}

			var from = app.payments.item.id === -1 ? $('#restore-frombalance').val() : $('#frombalance').val();

			from = parseFloat(from);

			if(isNaN(from)){
				from = 0;
			}

			var price = app.payments.item.price - from;

			price = price + (price / 100 * amount);

			commission.html(price.toFixed(2) + ' руб.');
		});
	},
	'last': function(){

		var self = this;

		var block = $('#drop-id-copy').html();

		var lastid = $('.drops > .drop-list > .drop-id:first-child');

		return app.request('/?payments/last/', {'id': lastid.attr('data-payment-id'), 'key':lastid.attr('data-token')}, function(data){
			setTimeout(function(){ app.payments.last(); }, app.payments.last_timeout);

			if(!data.type){ return; }

			if(!$.isEmptyObject(data.data) && block){
				block = block.replace(/\{ITEM_ID\}/g, data.data.id);
				block = block.replace(/\{ITEM_TOKEN\}/g, data.data.token);
				block = block.replace(/\{ITEM_IMAGE\}/g, data.data.image);
				block = block.replace(/\{ITEM_TITLE\}/g, data.data.title);
				block = block.replace(/\{PAYMENT_ID\}/g, data.data.payment_id);
				block = block.replace(/\{PAYMENT_PLAYER\}/g, data.data.payment_player);
				block = block.replace(/\{PAYMENT_DATE\}/g, data.data.payment_date);
				block = block.replace(/\{PAYMENT_TIMING\}/g, data.data.payment_timing);

				$('.drops > .drop-list').prepend(block);

				$('.drops > .drop-list > .drop-id:first-child').attr('data-wow-duration', '0.6s').addClass('wow animate__animated animate__fadeInLeft');

				$('.drops > .drop-list > .drop-id:nth-child(n+7)').remove();
			}
		}, function(data){
			console.log(data);

			setTimeout(function(){ app.payments.last(); }, app.payments.last_timeout);
		});
	},

	'price': function(button){

		var self = this;

		if(typeof app.payments.price_timeout != 'undefined'){
			clearTimeout(app.payments.price_timeout);
		}

		$('.modal .input-error, .modal .input-alert').html('');//hide();

		self.item = {};

		var form = button.closest('form');

		// Блок цены
		var priceblock = $('#price-block');

		// Итоговая цена
		var pricevalue = $('#price-block .value');

		// Цена без учета скидок
		var purevalue = $('#price-block .pure_value');

		purevalue.hide();
		priceblock.removeClass('alerted active');

		var from = $('#frombalance');
		var from2 = $('#frombalance2');

		var balance = parseFloat(from.attr('data-max'));

		if(isNaN(balance)){ balance = 0; }

	},
};

$(function(){
	var wow = new WOW(
		{
			boxClass:     'wow',      // animated element css class (default is wow)
			animateClass: 'animated', // animation css class (default is animated)
			offset:       0,          // distance to the element when triggering the animation (default is 0)
			mobile:       true,       // trigger animations on mobile devices (default is true)
			live:         true,       // act on asynchronously loaded content (default is true)
			scrollContainer: null,    // optional scroll container selector, otherwise use window,
			resetAnimation: true     // reset animation on end (default is true)
		}
	);

	setInterval(function(){
		$('.drops > .drop-list > .drop-id').each(function(){
			var that = $(this);

			var unixtime = parseInt(that.attr('data-payment-timing'));

			that.find('.date').html(app.date.toFormat(unixtime));
		});
	}, 2500);

	setTimeout(function(){
		wow.init();
		//app.payments.last();
	}, 0);

	$('body').on('click', '.scroll-to-category', function(e){
		e.preventDefault();

		var that = $(this);

		pipui.tabs.active(that.attr('data-to'));

		var offset = $('.donate .tabs > .tab-links').offset();

		if(!offset){ return e; }

		var scroll = offset.top;

		$('html').animate({
			scrollTop: scroll
		}, {
			duration: 800,
			easing: "easeInOutQuad"
		});
	}).on('click', '.main .drops > .drop-list > .drop-id', function(e){
		e.preventDefault();
		$('.main .donate .items > .item-list > .item-id[data-modal="donate"][data-id="'+$(this).attr('data-id')+'"]').trigger('click');
	}).on('click', '[data-modal="donate"]', function(){
		var that = $(this);

		var item = that.closest('.item-id');

		var modal = $('.modal[data-id="donate"]');

		var data = item.find('.data');

		var id = data.find('.data-id').html();
		var title = data.find('.data-title').html();
		var text = data.find('.data-text').html();
		var description = data.find('.data-description').html();
		var price = data.find('.data-price').html();
		var amounted = parseInt(data.find('.data-amounted').html());
		var min = parseInt(data.find('.data-min').html());
		var forever = parseInt(data.find('.data-forever').html());
		var discount = parseFloat(data.find('.data-discount').html());
		var image = data.find('.data-image').html();

		$('.modal[data-id="method"] [name="type"]').val('donate');

		price = parseFloat(price);

		var from = $('#frombalance');

		from.val(0);
		$('#frombalance2').val(0);

		var max = from.attr('data-max');
		max = parseFloat(max);

		if(max > price){
			from.attr('max', price);
		}else{
			from.attr('max', max);
		}

		if(forever){
			title += ' <span class="forever">Навсегда*</span>';
		}

		if(discount){
			title += ' <span class="discount">-'+discount+'%</span>';
		}

		modal.find('.modal-header').html(title);
		modal.find('[name="id"]').val(id);

		var alert = modal.find('.modal-body .alertblock');

		modal.find('#donate-amount').attr('min', min).val(min);

		if(amounted){
			modal.find('#input-amount').show();
		}else{
			modal.find('#input-amount').hide();
		}

		modal.find('.image').css('background-image', 'url('+image+')');

		alert.hide();

		alert.find('.text').html(text);
		modal.find('.description').html(description);

		$('#donate-modal-footer').removeClass('active error');

		if(text.length){
			alert.fadeIn('slow');
		}

		modal.find('#price-block .value').html(price+' РУБ.').attr('data-value', price);

		//modal.find('[type="submit"]').html('Купить за '+price+' <i class="fas fa-ruble-sign fs-12"></i>');

		setTimeout(function(){
			app.payments.price(modal.find('[type="submit"]'));
		}, 0);
	}).on('click', '#input-promo-trigger', function(e){
		e.preventDefault();

		$('#input-promo').slideToggle('fast');
	}).on('input', '.modal[data-id="donate"] input[type="number"]:not(#frombalance2), .modal[data-id="donate"] input[type="text"], .modal[data-id="donate"] input[type="email"], .modal[data-id="donate"] textarea', function(){

		app.payments.price($('.modal[data-id="donate"] [type="submit"]'));

	}).on('click', '.modal[data-id="donate"] [type="submit"]', function(e){
		e.preventDefault();

		var that = $(this);

		var balance = $('#frombalance2');

		if(balance.length > 0 && parseFloat(balance.val()) > 0){
			$('.modal[data-id="surcharge"]').attr('data-type', 'donate');
			return pipui.modal.open('surcharge');
		}

		if(that.hasClass('give')){
			app.payments.create($('.modal[data-id="donate"] [type="submit"]'));
		}else{
			//app.payments.item
			pipui.modal.open('method');
		}

	}).on('click', '#surcharge .surcharge-cancel', function(e){
		e.preventDefault();

		pipui.modal.close('surcharge');
	}).on('click', '#surcharge[data-type="donate"] .surcharge-submit', function(e){
		e.preventDefault();

		pipui.modal.close('surcharge');

		var submit = $('.modal[data-id="donate"] [type="submit"]');

		if(submit.hasClass('give')){
			app.payments.create(submit);
		}else{
			pipui.modal.open('method');
		}
	}).on('click', '.modal[data-id="method"] .methods [type="button"]', function(e){
		e.preventDefault();

		var that = $(this);

		var type = $('.modal[data-id="method"] [name="type"]').val();

		if(that.attr('data-confirm') == 'true'){

			var amount = parseFloat(that.attr('data-commission'));

			var from = app.payments.item.id === -1 ? $('#restore-frombalance').val() : $('#frombalance').val();

			from = parseFloat(from);

			if(isNaN(from)){
				from = 0;
			}

			var price = app.payments.item.price - from;

			price = price + (price / 100 * amount);

			$('#confirm-choice > .price').html(price.toFixed(2) + ' руб.');

			var commiss = parseFloat($('[data-type="unitpay-card"]').attr('data-commission'));

			price = app.payments.item.price + (app.payments.item.price / 100 * commiss) - from

			if(price < 0){
				price = 0;
			}

			$('#alter-choice > .price').html(price.toFixed(2) + ' руб.');

			app.payments.submit = {
				'method': that.attr('data-type'),
				'type': type
			};

			pipui.modal.open('confirm');

			return;
		}

		$('.modal[data-id="method"] .methods [type="button"]').prop('disabled', true);

		that.addClass('active');

		//$('.modal[data-id="restore"] [type="submit"]')

		if(type == 'restore'){
			$('.modal[data-id="restore"] [name="method"]').val(that.attr('data-type'));

			app.payments.create($('.modal[data-id="restore"] [type="submit"]'));
		}else{
			$('.modal[data-id="donate"] [name="method"]').val(that.attr('data-type'));

			app.payments.create($('.modal[data-id="donate"] [type="submit"]'));
		}
	}).on('click', '#confirm-choice', function(e){
		e.preventDefault();

		if(app.payments.submit.type == 'restore'){
			$('.modal[data-id="restore"] [name="method"]').val(app.payments.submit.method);

			app.payments.create($('.modal[data-id="restore"] [type="submit"]'));
		}else{
			$('.modal[data-id="donate"] [name="method"]').val(app.payments.submit.method);

			app.payments.create($('.modal[data-id="donate"] [type="submit"]'));
		}


	}).on('input', '#donate-amount', function(){

		var that = $(this);

		var value = parseInt(that.val());

		var min = parseInt(that.attr('min'));

		if(isNaN(value) || value < min){
			that.val(min);
		}

	}).on('click', '#input-amount .plus, #input-amount .minus', function(e){
		e.preventDefault();

		var that = $(this);

		var input = that.closest('.input-prepend').find('input');

		var min = parseInt(input.attr('min'));

		var amount = parseInt(input.val());

		if(isNaN(amount)){
			amount = 1;
		}

		if(that.hasClass('minus')){
			amount--;
		}else{
			amount++;
		}

		if(amount <= 0){
			amount = 1;
		}

		if(amount < min){
			amount = min;
		}

		input.val(amount);

		$('.modal[data-id="donate"] #donate-amount').trigger('input');
	}).on('change', '#receipt', function(e){
		var email = $('#input-email');

		if($(this).prop('checked')){
			email.show();
		}else{
			email.hide();
		}

		$('.modal[data-id="donate"] input[type="text"]').trigger('input');
	}).on('change', '#gift', function(e){
		var block = $('#gift-block');

		if($(this).prop('checked')){
			block.show();
		}else{
			block.hide();
		}

		$('.modal[data-id="donate"] input[type="text"]').trigger('input');
	}).on('input', '#frombalance, #frombalance2', function(){
		var that = $(this);

		var value = that.val();
		value = parseFloat(value);

		var pricevalue = $('#price-block .value');

		var price = parseFloat(pricevalue.attr('data-value'));

		var pay = parseFloat((price - value).toFixed(2));

		pricevalue.html(pay + ' РУБ.');

		var button = $('.modal[data-id="donate"] [type="submit"]');

		var surcharge = parseInt(button.attr('data-surcharge'));

		if(!pay){
			button.html('<i class="fas fa-coins"></i> Получить').addClass('give');
		}else{

			var text = surcharge == 1 ? 'Доплатить' : 'Купить';

			button.html('<i class="fas fa-coins"></i> '+text).removeClass('give');
		}

		app.payments.changeMethodPrice();

	}).on('change', '#restore-receipt', function(){
		var that = $(this);

		if(that.prop('checked')){
			$('#restore-email').closest('.input-block').fadeIn('fast');
		}else{
			$('#restore-email').closest('.input-block').fadeOut('fast');
		}
	}).on('input', '#restore-frombalance, #restore-frombalance2', function(){

		var from = $('#restore-frombalance');

		var price = from.attr('data-price');

		price = parseFloat(price);

		var max = parseFloat(from.attr('max'));

		var cur = parseFloat(from.val());

		var button = $('.modal[data-id="restore"] [type="submit"]');

		if(cur > max){
			$('#restore-frombalance, #restore-frombalance2').val(max);
		}

		if(cur == price){
			button.addClass('give');
			button.find('span').html('Отправить');
		}else{
			button.removeClass('give');
			button.find('span').html('Купить');
		}

		var result = price - cur;

		$('#restore-price-block > .value').html(result.toFixed(2));

		app.payments.changeMethodPrice();
	}).on('change', '.attachments .input-block-file [type="file"]', function(){
		var that = $(this);

		var formData = new FormData();

		formData.append('image', that[0].files[0]);

		return app.request('/?upload/image', formData, function(data){

			pipui.alert.open(data.text, data.title);

			if(!data.type){ return; }

			var block = that.closest('.input-block-file');

			block.find('.btn').html(that[0].files[0].name);

			var type = block.attr('data-type');

			$('.modal[data-id="restore"] [name="'+type+'"]').val(data.data.url);

			block.addClass('success');

			if(type == 'attachment1'){
				$('.attachments .input-block-file[data-type="attachment2"]').show();
			}else if(type == 'attachment2'){
				$('.attachments .input-block-file[data-type="attachment3"]').show();
			}
		}, function(data){
			console.log(data);

			pipui.modal.close('method');

			button.prop('disabled', false);

			$('.modal[data-id="method"] .methods [type="button"]').prop('disabled', false).removeClass('active');
		});
	}).on('click', '[data-modal="restore"]', function(){

		var that = $(this);

		var price = parseFloat(that.find('.data .data-price').html());

		app.payments.item = {
			id: -1,
			price: price
		};

		app.payments.changeMethodPrice();

		$('.modal[data-id="method"] [name="type"]').val('restore');
	}).on('click', '.modal[data-id="restore"] [type="submit"]', function(e){
		e.preventDefault();

		var that = $(this);

		var error = false;

		var social = $('#restore-social');
		var social_error = social.closest('.input-block').find('.input-error');

		if(!/^http(s)?\:\/\/(.*)$/.test(social.val())){
			error = true;
			social_error.html('Неверный формат ссылки на ВК/ТГ').show();
		}

		var login = $('#restore-login');
		var login_error = login.closest('.input-block').find('.input-error');

		if(!/^[a-z0-9A-Z_\.\-]{1,32}$/.test(login.val())){
			error = true;
			login_error.html('Неверный формат никнейма игрока').show();
		}

		var date = $('#restore-date');
		var date_error = date.closest('.input-block').find('.input-error');

		if(!date.val()){
			error = true;
			date_error.html('Необходимо указать дату покупки').show();
		}

		var number = $('#restore-number');
		var number_error = number.closest('.input-block').find('.input-error');

		if(!number.val()){
			error = true;
			number_error.html('Необходимо номер заказа').show();
		}

		var text = $('#restore-text');
		var text_error = text.closest('.input-block').find('.input-error');

		if(!text.val()){
			error = true;
			text_error.html('Необходимо указать комментарий для администрации').show();
		}

		var email = $('#restore-email');
		var email_error = email.closest('.input-block').find('.input-error');

		var receipt = $('#restore-receipt');

		if(receipt.prop('checked') && !/^[\w\.\-]+@[\w\.\-]+$/.test(email.val())){
			error = true;
			email_error.html('Неверный формат E-Mail адреса').show();
		}

		var balance = $('#restore-frombalance2');

		if(balance.length > 0 && parseFloat(balance.val()) > 0){

			$('.modal[data-id="surcharge"]').attr('data-type', 'restore');
			return pipui.modal.open('surcharge');
		}

		if(!error){
			if(that.hasClass('give')){
				app.payments.create(that);
			}else{

				pipui.modal.open('method');
			}
		}

	}).on('click', '#surcharge[data-type="restore"] .surcharge-submit', function(e){
		e.preventDefault();

		pipui.modal.close('surcharge');

		var submit = $('.modal[data-id="restore"] [type="submit"]');

		if(submit.hasClass('give')){
			app.payments.create(submit);
		}else{

			pipui.modal.open('method');
		}
	}).on('input', '.modal[data-id="restore"] input, .modal[data-id="restore"] textarea', function(){
		$(this).closest('.modal').find('.input-error').html('').hide();
	}).on('click', '#commission .commission-cancel', function(e){
		e.preventDefault();

		$('.modal[data-id="method"] .methods [type="button"]').prop('disabled', false).removeClass('active');
		pipui.modal.close('commission');
	}).on('click', '.modal', function(e){
		var target = $(e.target);
		if(!target.closest('.modal-content').length){

			$('.modal[data-id="donate"] [type="submit"], .modal[data-id="restore"] [type="submit"]').prop('disabled', false);
			if(target.closest('.modal').attr('id') == 'commission'){
				$('.modal[data-id="method"] .methods [type="button"]').prop('disabled', false).removeClass('active');
			}
		}
	}).on('click', '.modal[data-id="success-payment"] [data-close]', function(e){
		e.preventDefault();

		pipui.modal.close('success-payment');
	});
});