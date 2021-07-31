import spark.Spark.*
import spark.Request
import spark.Response
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.sql.DriverManager
import java.util.*
//const val URL = "jdbc:postgresql://localhost/fps"
//const val USER = "postgres"
//const val PASSWORD = "admin"

class MyLevel {
    companion object{
        var levelItems: MutableList<LevelItem> = mutableListOf(LevelItem(id=47, x=7, y=4, type="wall"), LevelItem(id=46, x=6, y=4, type="wall"), LevelItem(id=57, x=7, y=5, type="light"), LevelItem(id=48, x=8, y=4, type="enemy"))
        var nick = ""
        var score = 0
    }
}
data class LevelItem(
    var id:Int,
    var x:Int,
    var y:Int,
    var type:String
)

data class ScoreItem(var id: Int, val nick: String, val score: Int)

fun main() {
    staticFiles.location("/public")
    port(getHerokuPort())
    get("/") { request, response -> "index.html" }
    get("/get-level"){request, response -> sendLevel(request, response) }
    get("/get-score"){request, response -> getScore(request, response) }
    post("/save-level") {request, response -> saveLevel(request, response) }
    post("/add-score") {request, response -> addScore(request, response) }
    post("/send-nick") {request, response -> sendNick(request, response) }
    post("/send-score") {request, response -> sendScore(request, response) }
}

fun getHerokuPort(): Int {
    val processBuilder = ProcessBuilder()
    return if (processBuilder.environment()["PORT"] != null) {
        processBuilder.environment()["PORT"]!!.toInt()
    } else 5000
}

fun sendLevel(req: Request, res: Response): String {
    res.header("Access-Control-Allow-Origin", "*")
    res.type("application/json")
    val levelLoader = Gson().toJson(MyLevel.levelItems)
    println("sending level")
    println(levelLoader)
    return levelLoader
}
fun getScore(req: Request, res: Response): String {
    res.header("Access-Control-Allow-Origin", "*")
    res.type("application/json")
    val data = mutableListOf<ScoreItem>()
    val conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/fps", "postgres", "admin")
    val stmt = conn.createStatement()
    val query = "SELECT * FROM scoreboard"
    val result = stmt.executeQuery(query)
    while (result.next()) {
        data.add(ScoreItem(result.getInt("id"), result.getString("nick"), result.getInt("score")))
    }
    conn.close()
    println(Gson().toJson(data))
    return Gson().toJson(data)
}

fun saveLevel(req: Request, res: Response) {
    res.header("Access-Control-Allow-Origin", "*")
    val data = req.body()
    val type = object : TypeToken<MutableList<LevelItem>>() {}.type
    var list: MutableList<LevelItem> = Gson().fromJson(data, type)
    println("saving level")
    println(list)
    MyLevel.levelItems = list
}

fun sendNick(req: Request, res: Response) {
    res.header("Access-Control-Allow-Origin", "*")
    val data = req.body()
    MyLevel.nick = data
}

fun sendScore(req: Request, res: Response) {
    res.header("Access-Control-Allow-Origin", "*")
    val data = req.body()
    MyLevel.score = data.toInt()
}

fun addScore(req: Request, res: Response) {
    res.type("application/json")
    val nickname = MyLevel.nick
    val score =  MyLevel.score
    val conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/fps", "postgres", "admin")
    val stmt = conn.createStatement()
    val query = "INSERT INTO scoreboard (nick, score) VALUES ('${nickname}', '${score}')"
    stmt.execute(query)
    conn.close()

}