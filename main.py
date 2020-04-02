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
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


#  run on import
requests_cache.install_cache(cache_name='dining_cache', backend='memory', expire_after=600)
requests_cache.install_cache(cache_name='retail_cache', backend='memory', expire_after=600)

# TODO: separate in into separate functions with timers to update fields instead of waiting for a request
@app.route('/', methods=['GET'])
def main():
	dining_data = requests.get(url="https://downtownsantacruz.com/_api/v2/covid-dining.json").json()
	retail_data = requests.get(url="https://downtownsantacruz.com/_api/v2/covid-retail.json").json()
	businesses = dict()
	content = {'header': "I'm a header", 'header_link': "https://baconipsum.com/",
	           'subheader1': "I'm the first subheading", 'subheader1_link': "https://baconipsum.com/",
	           'subheader2': "I'm the second subheading", 'subheader2_link': "https://baconipsum.com/",
	           'subheader3': "I'm the thrid subheading", 'subheader3_link': "https://baconipsum.com/"}
	pictures = ["http://www.slojazzfest.org/uploads/1/7/0/6/17061274/woodstock-pizza-jpeg_6_orig.jpg",
	            "https://woodstocksslo.com/wp-content/uploads/sites/6/2019/03/Triple_Threat_Menu_Header-min-1024x421.jpg",
	            "https://woodstocksdavis.com/wp-content/uploads/sites/9/2018/02/Menu_Hero_TLSB_8757224_9921733.jpg"]

	online_order_link = "https://woodstocks-pizza-santa-cruz.securebrygid.com/zgrid/proc/site/sitep.jsp"

	CSV_URL = 'https://docs.google.com/spreadsheets/d/1aCrPNN8GxowAwFjAo56SPBPmR24-iV9GLjnnGAu66O4/export?format=csv&id=1aCrPNN8GxowAwFjAo56SPBPmR24-iV9GLjnnGAu66O4&gid=1716473960'
	with requests.Session() as s:
		download = s.get(CSV_URL)
		decoded_content = download.content.decode('utf-8')
		form_data = list(csv.reader(decoded_content.splitlines(), delimiter=','))[1:]
		for business in dining_data:
			for business_row in form_data:
				if (business['properties']['point_name'] == business_row[1]):
					businesses[business['properties']['point_id']] = ({'DTA_data': business,
					                                               'type': 'dining',
					                                               'images': [business_row[6], business_row[7],
					                                                          business_row[8], business_row[9],
					                                                          business_row[10]],
					                                               'online_order_link': business_row[3],
					                                               'content': {'header': business_row[2],
					                                                           'header_link': business_row[3],
					                                                           'subheader1': business_row[4],
					                                                           'subheader1_link': business_row[5],
					                                                           }})
			if business['properties']['point_id'] not in businesses:
				businesses[business['properties']['point_id']] = ({'DTA_data': business,
				                                               'type': 'dining',
				                                               'images': pictures,
				                                               'online_order_link': online_order_link,
				                                               'content': content})
		for business in retail_data:
			for business_row in form_data:
				if (business['properties']['point_name'] == business_row[1]):
					businesses[business['properties']['point_id']] = ({'DTA_data': business,
					                                               'type': 'retail',
					                                               'images': [business_row[6], business_row[7],
					                                                          business_row[8], business_row[9],
					                                                          business_row[10]],
					                                               'online_order_link': business_row[3],
					                                               'content': {'header': business_row[2],
					                                                           'header_link': business_row[3],
					                                                           'subheader1': business_row[4],
					                                                           'subheader1_link': business_row[5],
					                                                           }})
			if business['properties']['point_id'] not in businesses:
				businesses[business['properties']['point_id']] = ({'DTA_data': business,
				                                               'type': 'dining',
				                                               'images': pictures,
				                                               'online_order_link': online_order_link,
				                                               'content': content})
	return json.dumps(businesses)


def _groups():
	group_data = requests.get("https://downtownsantacruz.com/_api/v2/groups.json").json()
	# Remap the list as a dictionary as the keys in the provided API have no meaning, discarding those keys and the group type
	# group dict's keys will be the group id and the value will be the properties
	group_data = {group['properties']['group_id']: group['properties'] for group in group_data}
	return group_data


@app.route('/groups', methods=['GET'])
def groups():
	return json.dumps(_groups())


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
