#!/usr/bin/env python3.6
"""
Carter Frost
For hosting a website for Santa Cruz Map for businesses a virtual downtown shopping experience,
making it easier for locals to support local businesses.
"""

import requests
import requests_cache
from flask import Flask
import json
import csv
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#  run on import
requests_cache.install_cache(cache_name='dining_cache', backend='memory', expire_after=600) 
#requests_cache.install_cache(cache_name='retail_cache', expire_after=600)

@app.route('/dining.json', methods=['GET'])
def main():
	dining_data = requests.get(url="https://downtownsantacruz.com/_api/v2/covid-dining.json").json()
	dining = dict()
	form_data = list()
	content = {'header': "I'm a header", 'header_link': "https://baconipsum.com/",
				'subheader1': "I'm the first subheading", 'subheader1_link': "https://baconipsum.com/",
				'subheader2': "I'm the second subheading" , 'subheader2_link': "https://baconipsum.com/",
				'subheader3': "I'm the thrid subheading", 'subheader3_link': "https://baconipsum.com/"}
	pictures = ["https://woodstocksslo.com/wp-content/uploads/sites/6/2019/03/Triple_Threat_Menu_Header-min-1024x421.jpg",
			"https://woodstocksdavis.com/wp-content/uploads/sites/9/2018/02/Menu_Hero_TLSB_8757224_9921733.jpg"]

	online_order_link = "https://woodstocks-pizza-santa-cruz.securebrygid.com/zgrid/proc/site/sitep.jsp"

	CSV_URL = 'https://docs.google.com/spreadsheets/d/1aCrPNN8GxowAwFjAo56SPBPmR24-iV9GLjnnGAu66O4/export?format=csv&id=1aCrPNN8GxowAwFjAo56SPBPmR24-iV9GLjnnGAu66O4&gid=1716473960'
	with requests.Session() as s:
		download = s.get(CSV_URL)
		decoded_content = download.content.decode('utf-8')
		form_data = list(csv.reader(decoded_content.splitlines(), delimiter=','))[1:]
		for business in dining_data:
			for bussness_row in form_data:
				if(business['properties']['point_name'] == bussness_row[1]):
					dining[business['properties']['point_id']] = ({'DTA_data': business,
					                                               'images': [bussness_row[6],bussness_row[7],bussness_row[8],bussness_row[9],bussness_row[10]],
					                                               'online_order_link': bussness_row[3],
					                                               'content': {'header': bussness_row[2],
					                                                           'header_link': bussness_row[3],
					                                                           'subheader1': bussness_row[4],
					                                                           'subheader1_link': bussness_row[5],
					                                                           }})
			if business['properties']['point_id'] not in dining:
				dining[business['properties']['point_id']] = ({'DTA_data': business,
				                                               'images': pictures,
				                                               'online_order_link': online_order_link,
				                                               'content': content})

	return json.dumps(dining)

#retail_data = requests.get(url="https://downtownsantacruz.com/_api/v2/covid-retail.json").json()

@app.route('/static/<name>')
def resource(name):
	"""Load a file from the static directory and return it to the browser."""
	with open('static/' + name, 'rb') as f:
		return f.read()


@app.errorhandler(500)
def server_error(e):
	""" Just that it is an error handler"""
	print("Borked", e)
	return 'I done borked up.', 500


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8080)
