//APIキーの設定とSDKの初期化
var appKey    = "50a945c15520b92f21cf848ec99938676e5987bef7d8ab7f18b5cf9f78542210";
var clientKey = "5995c27f953fa4fe7ee74fa1f35a343c2c6fdab7c74acb2a1da83cdcc71047a8";
var ncmb    　= new NCMB(appKey,clientKey);

// -------[Demo1]データをmBaaSに保存する -------//
function sendForm() {
        
    //ユーザーの入力したデータを変数にセットする
    var taskname    = $("#form_name").val();            //タスク名
    var date        = $("#form_date").val();             //期限日
    var time        = $("#form_time").val();             //期限時間
    var priority    = $("#form_priority").val();        //重要度
    var condition   = $("#form_condition").val();       //調子
    var days        = $("#form_days").val();            //記録数
    var level       = $("#form_level").val();           //進化段階
              
    //数値に変換
    priority = Number(priority);
    days = Number(days);
    level = Number(level);
    
    //期限日と時間を合わせる
    //var dateandtime = date+" "+time;   
    var limit = date+" "+time;    
    //Date型に変換
    //var limit = new Date(dateandtime);

    //入力規則およびデータをフィールドにセットする
    if(taskname == ""){
        alert("タスク名が入力されていません");
    }else if( date == "" || time == "" ){
        alert("期限日が入力されていません");
    }else if(priority == ""){
        alert("重要度が入力されていません");
    }else{
        //mBaaSに保存先クラスの作成
        var SaveData = ncmb.DataStore("SaveData");
            
        //インスタンスの生成
        var saveData = new SaveData();
            
        //インスタンスにデータをセットする
        saveData.set("taskname", taskname)
                .set("limit", limit)
                .set("priority", priority)
                .set("condition", condition)
                .set("days", days)
                .set("level", level)
                .save()
                .then(function(results){
                    //保存に成功した場合の処理
                    alert("お問い合わせを受け付けました");
                    console.log("お問い合わせを受け付けました");
                    location.reload();
                })
                .catch(function(error){
                    //保存に失敗した場合の処理
                    alert("受け付けできませんでした：\n" + error);
                    console.log("受け付けできませんでした：\n" + error);
                });
    }
}

//------- [Demo2]保存したデータを全件検索し取得する-------//
function checkForm(){
    $("#formTable").empty();
        
    //インスタンスの生成
    var saveData = ncmb.DataStore("SaveData");
        
    //データを降順で取得する
    saveData.order("limit")
            .fetchAll()
            .then(function(results){
                //全件検索に成功した場合の処理
                console.log("全件検索に成功しました："+results.length+"件");
                //テーブルにデータをセット
                setData(results);
            })
            .catch(function(error){
                //全件検索に失敗した場合の処理
                alert("全件検索に失敗しました：\n" + error);
                console.log("全件検索に失敗しました：\n" + error);
            });
}

//------- [Demo3]日付を指定して検索し取得する -------//
function checkDate(divider){
    //データを変数にセット
    var searchdate  = $("#search_date").val();
    var searchtime  = $("#search_time").val();
        
    //検索用に二つの変数を合体
    var dateandtime = searchdate+" "+searchtime;
        
    //Date型に変換
    var date = new Date(dateandtime);
    date.setHours(date.getHours() + 9); 
        
    //インスタンスの生成
    var saveData  = ncmb.DataStore("SaveData");
        
    //データの取得：三項演算子(条件 ? 真:偽)によって以前と以後の処理を分ける
    (divider ? saveData.lessThanOrEqualTo("createDate", { "__type": "Date", "iso": date.toISOString() }) : saveData.greaterThanOrEqualTo("createDate", { "__type": "Date", "iso": date.toISOString() }))
                       .order("createDate",true)
                       .fetchAll()
                       .then(function(results){
                           //日付の検索に成功した場合の処理
                           console.log("日付の検索に成功しました："+results.length+"件");
                           setData(results);
                       })
                       .catch(function(error){
                           //日付の検索に失敗した場合の処理
                           alert("日付の検索に失敗しました：\n" + error);
                           console.log("日付の検索に失敗しました：\n" + error);
                       });
}

//テーブルにデータをセットする処理
function setData(results) {
    //操作するテーブルへの参照を取得
    var table = document.getElementById("formTable");
        for(i=0; i<results.length; i++) {
            var object = results[i];
            var year     = object.get("limit").slice(0,4);      //YYYYを取り出す
            var month    = object.get("limit").slice(5,7);      //MMを取り出す
            var day      = object.get("limit").slice(8,10);     //DDを取り出す            
            var hour     = object.get("limit").slice(11,13);    //hhを取り出す
            var minute   = object.get("limit").slice(14,16);    //mmを取り出す
                
            //hourが協定時間なので、現地時間（+09:00）となるようにする
            var datehour = new Date(hour);  //hourをDate型に変換
            var jsthour  = datehour.getHours();  //datehourを現地時間にする
            var jstDate  = year + "/" + month + "/" + day + " " + hour +":"+ minute;
                
            //テーブルに行とセルを設定
            var row      = table.insertRow(-1);
            var cell     = row.insertCell(-1);
                
            formTable.rows[i].cells[0].innerHTML = jstDate + "<br>" + "タスク名：　" + object.get("taskname") +"<br>" +"重要度："+object.get("priority");
        }
    var searchResult = document.getElementById("searchResult");
    searchResult.innerHTML = "タスク数："+results.length+"件";
        
    //セットするデータが無かった場合
    if(results.length == 0){
        var table = document.getElementById("formTable");
        formTable.innerHTML = "<br>" + "<center>" + "データはありません" + "</center>" + "<br>";   
    }
    $.mobile.changePage('#ListUpPage');
}



