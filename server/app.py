from flask import Flask, request
from db import DB

app = Flask(__name__)

@app.route("/rollercoasters/<int:id>", methods=["OPTIONS"])
def do_preflight(id):
    return '', 204, {"Access-Control-Allow-Origin":"*",
                     "Access-Control-Allow-Methods": "PUT, DELETE",
                     "Access-Control-Allow-Headers": "Content-Type"}

@app.route("/rollercoasters", methods=["GET"])
def get_rollercoasters():
    db = DB("rollercoasters.db")
    rollercoasters = db.readAllRecords()
    return rollercoasters, {"Access-Control-Allow-Origin":"*"}

@app.route("/rollercoasters", methods=["POST"])
def create_rollercoaster():
    db = DB("rollercoasters.db")
    print(request.form)
    d = {
        "name": request.form['name'],
        "manufacturer": request.form['manufacturer'],
        "type": request.form['type'],
        "description": request.form['description'],
        "rating": request.form['rating']
    }
    db.saveRecord(d)
    return "Created", 201, {"Access-Control-Allow-Origin":"*"}

@app.route("/rollercoasters/<int:id>", methods=["DELETE"])
def delete_rollercoaster(id):
    db = DB("rollercoasters.db")
    rollercoaster = db.getRollercoaster(id)
    if rollercoaster:
        db.deleteRecord(id)
        return "Deleted", 200, {"Access-Control-Allow-Origin":"*"}
    else:
        return "Cannot delete with id of {id}", 404, {"Access-Control-Allow-Origin":"*"}

@app.route("/rollercoasters/<int:id>", methods=["PUT"])
def edit_rollercoaster(id):
    db = DB("rollercoasters.db")
    d = {
        "name": request.form['name'],
        "manufacturer": request.form['manufacturer'],
        "type": request.form['type'],
        "description": request.form['description'],
        "rating": request.form['rating']
    }
    rollercoaster = db.getRollercoaster(id)
    if rollercoaster:
        db.editRecord(id, d)
        return "Edited", 200, {"Access-Control-Allow-Origin":"*"}
    else:
        return "Cannot edit with id of {id}", 404, {"Access-Control-Allow-Origin":"*"}


def main():
    app.run()

main()