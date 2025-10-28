import sqlite3

def dict_factory(cursor, row):
    fields = []
    for column in cursor.description:
        fields.append(column[0])
        
    result_dict = {}
    for i in range(len(fields)):
        result_dict[fields[i]] = row[i]
        
    return result_dict

class DB:
    def __init__(self, dbfilename):
        self.dbfilename = dbfilename
        self.connection = sqlite3.connect(dbfilename)
        self.cursor = self.connection.cursor()
        
    def getRollercoaster(self, id):
        self.cursor.execute("SELECT * FROM rollercoasters WHERE id = ?", [id])
        rollercoaster = self.cursor.fetchone()
        print("This is the item: ", rollercoaster)
        if rollercoaster:
            return rollercoaster
        else:
            return None
        
    def readAllRecords(self):
        self.cursor.execute("SELECT * FROM rollercoasters")
        rows = self.cursor.fetchall()
        all = []
        for row in rows:
            d = dict_factory(self.cursor, row)
            all.append(d)
        print("the rows are", all)
        return all
    
    def deleteRecord(self, id):
        self.cursor.execute("DELETE FROM rollercoasters WHERE id=?", [id])
        self.connection.commit()
    
    def editRecord(self, id, record):
        data = [record['name'], record['manufacturer'], record['type'], record['description'], record['rating'], id]
        self.cursor.execute("UPDATE rollercoasters SET name=?, manufacturer=?, type=?, description=?, rating=? WHERE id=?;", data)
        self.connection.commit()
        
    def saveRecord(self, record):
        data = [record['name'], record['manufacturer'], record['type'], record['description'], record['rating']]
        self.cursor.execute("INSERT INTO rollercoasters (name, manufacturer, type, description, rating) VALUES(?, ?, ?, ?, ?);", data)
        self.connection.commit()
        
    def close(self):
        self.connection.close()
        
if __name__ == "__main__":
        db = DB("rollercoasters.db")
        db.readAllRecords()