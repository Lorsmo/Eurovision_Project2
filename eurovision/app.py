# import necessary libraries
from sqlalchemy import func, create_engine
import pandas as pd
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session

from flask import (
    Flask,
    render_template,
    jsonify)

from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/eurovision.sqlite"


db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

for t in Base.classes:
    print(t)

# Save references to each table
Eurovision = Base.classes.eurovision
Worldmapdata = Base.classes.worldmapdata

@app.before_first_request
def setup():
    # Recreate database each time for demo
    db.drop_all()
    db.create_all()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/editionname")
def editionName():
    """Return a list of editions"""
    
    query = db.session.query(Eurovision.edition.distinct().label("edition"))
    edition = [row.edition for row in query.all()]
    
    # Return a list of the column names (sample names)
    return jsonify(list(edition))

@app.route("/country")
def countries():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    results = db.session.query(Worldmapdata.to_country.distinct().label("to_country"))
    country = [row.to_country for row in results.all()]
   # Return a list of the column names (sample names)
    return jsonify(list(country))

@app.route("/countries")
def fromCountry():
  """Return a list of Countries"""
  query = db.session.query(Eurovision.from_country.distinct().label("countries"))
  countries = [row.countries for row in query.all()]
  # Return a list of the column names (sample names)
  return jsonify(list(countries))

@app.route("/years")
def years():
    """Return a list of sample names."""
    # Use Pandas to perform the sql query
    results = db.session.query(Worldmapdata.year.distinct().label("year"))
    year = [row.year for row in results.all()]
   # Return a list of the column names (sample names)
    return jsonify(list(year))

#@app.route("/<years>/rounds")
#def yearandround(years):
    #"""Return a list of sample names."""
    ## Use Pandas to perform the sql query
    #results = db.session.query(Eurovision.rounds, Eurovision.year).filter(Eurovision.year == years).group_by(Eurovision.rounds)
    #rounds = [row[0] for row in results]
   ## Return a list of the column names (sample names)
    #return jsonify(rounds)

################################################################################################
#@app.route("/worldmap")
#def worldMap():
#
    #results = db.session.query(Eurovision.year, Eurovision.points, Eurovision.to_country).all()
#
    ## session.cl/ose()
#
    #year = [result[0] for result in results]
    #points = [result[1] for result in results]
    #to_country = [result[2] for result in results]
#    
    #worldMap_data = [{
        #"year" : year,
        #"points": points,
        #"to_country" : to_country
    #}]
    #return jsonify(worldMap_data)

@app.route("/countryinfo/<to_country>")
def countryinfo(to_country):

    sel = [
       Worldmapdata.year,
       Worldmapdata.to_country,
       Worldmapdata.points,
    ]

    results = db.session.query(*sel).filter(Worldmapdata.to_country == to_country).group_by(Worldmapdata.year).order_by(Worldmapdata.points)
    print(results)
    year = [result[1] for result in results]
    to_country = [result[0] for result in results]
    points = [result[2] for result in results]
    print(year)

    worldMap_data = [{
        "year" : year,
        "to_country" : to_country,
        "points": points,        
    }]
    return jsonify(worldMap_data)

@app.route("/yearinfo/<year>")
def yearinfo(year):
    
    sel = [
       Worldmapdata.year,
       Worldmapdata.to_country,
       Worldmapdata.points,
       Worldmapdata.latitude, Worldmapdata.longitude,
    ]
    results = db.session.query(*sel).filter(Worldmapdata.year == year).group_by(Worldmapdata.to_country).order_by(Worldmapdata.points)
    
    year = [result[0] for result in results]
    to_country = [result[1] for result in results]
    points = [result[2] for result in results]
    latitude = [result[3] for result in results]
    longitude = [result[4] for result in results]
    worldMap_data = [{
        "year" : year,
        "to_country" : to_country,
        "points": points,
        "latitude" : latitude,
        "longitude" : longitude
        
    }]
    return jsonify(worldMap_data)

################################################################################################
@app.route("/barchart/<from_country>")
def barChart(from_country):
   sel = [
      Eurovision.jury_or_televoting,
      Eurovision.rounds,
      Eurovision.from_country,
      Eurovision.to_country,
      func.sum(Eurovision.points),
      ]
   results = db.session.query(*sel).filter(Eurovision.from_country == from_country).group_by(Eurovision.to_country)
   jort = [result[0] for result in results]
   rounds = [result[1] for result in results]
   from_country = [result[2] for result in results]
   to_country = [result[3] for result in results]
   points = [result[4] for result in results]
   barChart_data = [{
       "jury or Tele" : jort,
       "rounds": rounds,
       "from_country" : from_country,
       "to_country" : to_country,
       "points": points
   }]
   return jsonify(barChart_data)

################################################################################################
@app.route("/piechart/<rounds>")
def pieChart(rounds):
    sel = [
        Eurovision.rounds,
        Eurovision.to_country,
        func.sum(Eurovision.points),
    ]
    results = db.session.query(*sel).filter(Eurovision.rounds == rounds).group_by(Eurovision.to_country).order_by(func.sum(Eurovision.points).desc())
    
    rounds = [result[0] for result in results]
    to_country = [result[1] for result in results]
    points = [result[2] for result in results]
    

    pieChart_data = {
        "rounds": rounds,
        "value" : points,
        "label" : to_country
    }
    return jsonify(pieChart_data)

@app.route("/piechart/year/<edition>")
def pieEdition(edition):
    sel = [
        Eurovision.edition,
        Eurovision.to_country,
        func.sum(Eurovision.points),
    ]
    results = db.session.query(*sel).filter(Eurovision.edition == edition).group_by(Eurovision.to_country).order_by(func.sum(Eurovision.points).desc())
    
    edition = [result[0] for result in results]
    to_country = [result[1] for result in results]
    points = [result[2] for result in results]
    

    pieChart_data = {
        "edition": edition,
        "value" : points,
        "label" : to_country
    }
    return jsonify(pieChart_data)

#@app.route("/<year>/<rounds>")
#def pieEdition(year, rounds):
    #sel = [
        #Eurovision.rounds,
        #Eurovision.year,
        #Eurovision.to_country,
        #func.sum(Eurovision.points),
    #]
    #results = db.session.query(*sel).filter(Eurovision.year == year, Eurovision.rounds == rounds).group_by(Eurovision.to_country).order_by(func.sum(Eurovision.points).desc())
#    
    #rounds = [result[0] for result in results]
    #year = [result[1] for result in results]
    #to_country = [result[2] for result in results]
    #points = [result[3] for result in results]
#    
#
    #pieChart_data = {
        #"rounds": rounds,
        #"year": year,
        #"label" : to_country,
        #"value" : points,
    #}
    #return jsonify(pieChart_data)


@app.route("/cinfo/<to_country>")
def countryinfo1(to_country):
    # results = db.session.query(Worldmapdata.year==year, Worldmapdata.to_country, Worldmapdata.points, Worldmapdata.latitude, Worldmapdata.longitude).all()
    sel = [
        Worldmapdata.to_country,
        Worldmapdata.year,
        Worldmapdata.points,
    ]
    
    results = db.session.query(*sel).filter(Worldmapdata.to_country == to_country).group_by(Worldmapdata.year).order_by(Worldmapdata.year)
    print(results)
    to_country = [result[0] for result in results]
    year = [result[1] for result in results]
    points = [result[2] for result in results]
    print(year)

    worldMap_data = [{
        "to_country" : to_country,
        "year" : year,
        "points": points,        
    }]
    return jsonify(worldMap_data)

if __name__ == "__main__":
    app.run(debug=True)
