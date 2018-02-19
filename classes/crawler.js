"use strict";

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

module.exports = class Crawler {
	constructor() {
		const html = this.retrieveHtml()
		const $ = this.parseHtmlToCheerio(html)
	
		const parsedPlan = this.parsePlan($)
		
		return parsedPlan
	}

	/**
	 * Get html contents from assets directory
	 * 
	 * @return html source content
	 */
	retrieveHtml() {
		const html = fs.readFileSync('./assets/plano.html', 'utf-8')
		return html
	}

	/**
	 * Get source html and parse to cheerio,
	 * to manipulate the html using jquery functions
	 * 
	 * @param {*} html
	 * @return html parsed to cheerio
	 */
	parseHtmlToCheerio(html) {
		const $ = cheerio.load(html)
		return $
	}

	/**
	 * Parse the html, and return plan parsed
	 * 
	 * @param {*} $
	 * @return json formatted plan
	 */
	parsePlan($) {
		const planInformationParsed = this.parsePlanInformation($)
		const planBenefitsParsed = this.parsePlanBenefits($)

		return {
			...planInformationParsed,
			benefits: planBenefitsParsed
		}
	}

	/**
	 * Loop the list and parse the data using regex
	 * 
	 * @param {*} $ 
	 * @return formatted JSON
	 */
	parsePlanInformation($) {
		var arr = [];
		var franchise;
		var minutes;
		var flag;
		$('.notMobile').find('ul').each((i, element) => {
			const item = $(element).text().trim();
				
			if (flag = item.match(/(minutos\silimitados)/i)) 
				minutes = -1;
			else if (flag = item.match(/([\d.]+) *minutos/i)) {
				minutes = flag[0];
			}
			else if (flag = item.match(/(fale\silimitado)/i))
				minutes = -1;
				
			if (!franchise) {
				franchise = item.match(/([\d.]+) *GB/);
			}
			
		});

		var price = $("input[name='plano-valor']").val();
		var name = $("input[name='plano']").val();

		return {
			plan_name: name,
			internet: franchise[0],
			minutes: minutes,
			plan_price: price
		};

	}

	/**
	 * Loop benefits list and parse data using regex
	 * 
	 * @param {*} $ 
	 * @return array with all benefits
	 */
	parsePlanBenefits($) {
		var benefits = [];

		$('.notMobile').find('ul').each((i, element) => {
			var arr = $(element).find('li').map(function () {
				return $(this).text();
			}).toArray();
			benefits = benefits.concat(arr);
		});

		return benefits;
	}
}