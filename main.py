#!/usr/bin/env python3.6
"""
Carter Frost
For hosting a website for Santa Cruz Map for businesses a virtual downtown shopping experience,
making it easier for locals to support local businesses.
"""

import requests
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/', methods=['GET'])
def main():
	# this is a hack until we have access to the data in the API
	# this gets a list of businesses that delver, a few items are interpreted improperly
	deliver_list = [str(bName).split("<h2>")[1].split("</h2>")[0] for bName in
	requests.get(url="https://downtownsantacruz.com/downtown-delivered").iter_lines() if "<h2>" in str(bName)]

	businesses_data = requests.get(url="https://downtownsantacruz.com/_api/v2/points.json").json()
	businesses = [(business['properties']['point_id'],
	               business['geometry']['coordinates'][0],
	               business['geometry']['coordinates'][1],
	               business['properties']['point_name'],
	               business['properties']['address1'],
	               "/go/" + business['properties']['point_alias']
	               ) for business in businesses_data]
	return render_template('index.html', businesses=businesses)


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
