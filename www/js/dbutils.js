var db = {
    
    openDB: function() {
        var cotsDb = window.openDatabase("cotvt_admin", "1.0", "COT table", 1024*1000);
        cotsDb.transaction(function(transaction) {
            transaction.executeSql(sql.CREATE, [], function(transaction, results) {
            }, function(transaction, error) {
                console.log("error creating db: "+error.message);
            });
        });
        return cotsDb;
    },

    executeSQL: function(query, params, call, error){
        var cotsDb = window.openDatabase("cotvt_admin", "1.0", "COT table", 1024*1000);
        cotsDb.transaction(function(tx) {
            tx.executeSql(sql.CREATE,[],  
            function (transaction, sqlResultSet) {
                tx.executeSql(query, params, call, error);
            }, function (transaction, error) {
                console.log('error on table create: ' + error.message);
            });
        });
    },

    dropDB: function() {
        var cotsDb = window.openDatabase("cotvt_admin", "1.0", "COT table", 1024*1000);
        cotsDb.transaction(function(transaction) {
            transaction.executeSql(sql.DROP, [], function(transaction, results) {            
            }, function(transaction, error) {
                    console.log("erro deleting db: "+error.message);
            });
        });
        return 0;
    },

    insertCOT: function(observer_name, observer_tel, observer_email, observation_datetime, observation_location, 
                observation_localisation, observation_region, observation_country, 
                observation_latitude, observation_longitude, observation_number, observation_culled, 
                counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                depth_range0, depth_range1, depth_range2, observation_method0, observation_method1, remarks, date_enregistrement, save) {
        //var cotsDb = db.openDB();
        var depth_range = ( depth_range0.length > 0 ? depth_range0 : "")
                    +((depth_range0.length > 0 && depth_range1.length > 0) ? ", " : ((depth_range0.length>0 && depth_range2.length > 0) ? ", " : ""))
                    +(depth_range1.length>0?depth_range1:"")
                    +(depth_range1.length>0 && depth_range2.length>0?", ":"")
                    +(depth_range2.length>0?depth_range2:"");
        var observation_method = (observation_method0.length > 0 ? observation_method0 : "")
                    +((observation_method0.length>0 && observation_method1.length) > 0 ? ", " : "")
                    +(observation_method1.length>0?observation_method1:"");

        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.INSERT, 
                [observer_name, observer_tel, observer_email, observation_datetime, observation_location, 
                observation_localisation, observation_region, observation_country, 
                observation_latitude, observation_longitude, observation_number, observation_culled, 
                counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                depth_range, observation_method, 
                remarks, date_enregistrement], 
                function(transaction, results) {
                    return db.getidFormInsertCOT(observer_name, observer_tel, observer_email, observation_datetime, observation_location, 
                        observation_localisation, observation_region, observation_country, 
                        observation_latitude, observation_longitude, observation_number, observation_culled, 
                        counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                        depth_range, observation_method, 
                        remarks, date_enregistrement, save);
                }, function(e) {
                        console.log("insert error"+e.message);
                }
            );
            //});
    },

    //récupère l'id du nouveau formulaire a envoyé
    getidFormInsertCOT: function(observer_name, observer_tel, observer_email, observation_datetime, observation_location, 
                observation_localisation, observation_region, observation_country, 
                observation_latitude, observation_longitude, observation_number, observation_culled, 
                counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                depth_range, observation_method, 
                remarks, date_enregistrement, save) {
        //var cotsDb = db.openDB();
        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.SELECTidINSERT, [observer_name, observer_tel, observer_email, observation_datetime, observation_location, 
                    observation_localisation, observation_region, observation_country, 
                    observation_latitude, observation_longitude, observation_number, observation_culled, 
                    counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                    depth_range, observation_method, 
                    remarks, date_enregistrement],
             function(transaction, results) {
                for (i = 0; i < results.rows.length; i++){ 
                    var idform = results.rows.item(i).id;
                    return db.synchronizeCOTs("form", idform, save);
                }
            }, function(transaction, error) {            
                    app.updateMsg("An error occurred while sending the form, please try again later.");
            }
            );
       // });
    },

    synchronizeCOTs: function(from, id, save) {
        //var cotsDb = db.openDB();
        if(save == "true"){
            app.cancel(false);
            setTimeout(function(){app.updateMsg("Your form was successfully saved");},1000);
        }
        else if (save == "false"){
            //cotsDb.transaction(function(transaction) {
                db.executeSQL(sql.SELECT, [id], function(transaction, results) {
                    for(i=0; i<results.rows.length;i++){
                        // parse results in JSON
                        var item = JSON.stringify(results.rows.item(i));
                        // send results
                        db.sendRemote(item,results.rows.item(i).id,from);
                    }
                }, function(e) {
                    app.updateMsg("An error occurred while sending the form, please try again later.");
                });
            //});
        }
    },

    sendRemote: function(json,id,from){
        var retries = 5;
        db.send(json,id,from);
    },

    send: function(json,id,from){
        var wasSent = false;
        var url = url_fisheries;
        var xhr = (window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
        if(xhr == null){throw "Error: XMLHttpRequest failed to initiate.";}

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json = JSON.parse(xhr.responseText); 
                db.updateCOT(id);
                wasSent = true;
                app.close(wasSent);        
            } else if (xhr.readyState == 4) {
                app.close(wasSent);
            }
        }
        xhr.onerror = function() {
            retries--;
            if(retries > 0) {
                setTimeout(function(){db.send(json,id,from)}, 1000);
            } else {
                app.updateMsg("An error occurred while sending the form, please try again later.");
            }
        }

        try {
            xhr.open("POST", url, true);
            xhr.send(json); 

        } catch(e) {
            throw "Error retrieving data file. Some browsers only accept cross-domain request with HTTP.";
        }

    },

    updateCOT: function(id) {
        //var cotsDb = db.openDB();
        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.REMOVE, [id], 
                function(transaction, results) {}, 
                function(transaction, error) {}
            );
        //});
    },

    deleteCOT: function() {
        //var cotsDb = db.openDB();
        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.DELETE, [], function(transaction, results) {
                return 1;
            }, function(transaction,error) {            
                return 0;
            });
        //});
    },

    //On vérifie si des formulaires existe si oui on redirige ver le lien la list.html
    listCOTexist: function(){
        //var cotsDb = db.openDB();
            //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.SELECTexistLIST, [], function(transaction, results) {
                if (results.rows.length != 0){    
                    app.setNotificationsList(1,results.rows.length );
                }
                else{
                    app.setNotificationsList(0,0);
                }
            }, function(transaction,error) {            
                //console.log("some error updating data: list exist "+error.message);
                return 0;
            });
       // });
    },

    //On vérifie si list existe pour l'action new form
    listExistNewForm: function(){
    //var cotsDb = db.openDB();
    //cotsDb.transaction(function(transaction) {
        db.executeSQL(sql.SELECTexistLIST, [], function(transaction, results) {
            //console.log("Liste exist "+results.rows.length);
                if(results.rows.length !=0){
                    if($('#btn-cancel').length){  
                        $('#btn-cancel').show();
                    }
                }
            }, function(transaction,error) {            
                return 0;
            });
        //});
    },

    //On vérifie si list existe pour CLOSE
    listExistCLOSE: function(){
        //var cotsDb = db.openDB();
        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.SELECTexistLIST, [], function(transaction, results) {
                //console.log("Liste exist "+results.rows.length);
                if(results.rows.length !=0){
                    //retour a la liste a la fin de finaliser ou nouveau
                    document.getElementById("lien-reload").innerHTML = "Back to the list";
                    document.getElementById("lien-reload").onclick = app.cancel;
                }
        
            }, function(transaction,error) {            
                return 0;
            });
        //});
    },

    //Affichage de la liste
    listCOT: function(){
        var parentElement = document.getElementById("contentlist");
        var listeningElement = parentElement.querySelector('.cot_admin_list');
        //var cotsDb = db.openDB();
        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.SELECTCOTLIST, [], function(transaction, results) {
                app.updateMsg("You have " + results.rows.length + " form(s) to complete. Thank you for helping us protect Fiji's reefs.");
                for (i = 0; i < results.rows.length; i++){                     
                      //on remplit le tableau
                    listbdd = "<tr>"+
                        "<td data-th='Date of creation'>" + results.rows.item(i).date_enregistrement + "</td>"+
                        "<td data-th='Date'>" + results.rows.item(i).observation_datetime + "</td>"+
                        "<td data-th='COTS Nbr'>" + results.rows.item(i).observation_number + "</td>"+
                        "<td data-th='Place'>" + results.rows.item(i).observation_localisation + "</td>"+
                        "<td data-th='Delete'>"+
                            "<button type=button href=# onclick='return app.supprForm("+results.rows.item(i).id+")' class='btn fa fa-trash-o fa-lg'></button>"+
                        "</td>" + 
                        "<td data-th='Finalize'>"+
                            "<button type=button href=# onclick='return app.getFormLatLng("+results.rows.item(i).id+")' class='btn fa fa-pencil btn-success'> Finaliser</button>"+
                        "</td>" + 
                    "</tr>";
                    parentElement.querySelector('.cot_list_forms').innerHTML +=  listbdd;
                }
            }, function(transaction,error) {            
                //console.log("some error updating data: "+error.message);
                return 0;
            });
        //});
    },

    //On récupère l'id d'un formulaire pour charger ses données
    reditCOTForm: function(id){
        var cotsDb = window.openDatabase("cotvt_admin", "1.0", "COT table", 1024*1000);
        cotsDb.transaction(function(transaction) {
        transaction.executeSql(sql.SELECTreditCOTForm, [id], function(transaction, results) {
            //console.log("resultat "+ results.rows.length);

              for (i = 0; i < results.rows.length; i++){

                  app.reditForm(
                    results.rows.item(i).observer_name,
                    results.rows.item(i).observer_tel,
                    results.rows.item(i).observer_email,
                    results.rows.item(i).observation_datetime,
                    results.rows.item(i).observation_location,
                    results.rows.item(i).observation_localisation,
                    results.rows.item(i).observation_region,
                    results.rows.item(i).observation_country,
                    results.rows.item(i).observation_latitude,
                    results.rows.item(i).observation_longitude,
                    results.rows.item(i).observation_number,
                    results.rows.item(i).observation_culled,
                    results.rows.item(i).counting_method_timed_swim,
                    results.rows.item(i).counting_method_distance_swim,
                    results.rows.item(i).counting_method_other,
                    results.rows.item(i).depth_range,
                    results.rows.item(i).observation_method,
                    results.rows.item(i).remarks);
                }
        }, null);
        });
    },

    //On récupère la latitude et la longitude
    recupLatLng: function(id){
        var cotsDb = window.openDatabase("cotvt_admin", "1.0", "COT table", 1024*1000);
        return cotsDb.transaction(function(transaction) {
        transaction.executeSql(sql.SELECTreditCOTForm, [id], function(transaction, results) {
            for (i = 0; i < results.rows.length; i++){
                window.location.href="./index.html?id="+ id +
                "&?lat=" + results.rows.item(i).observation_latitude +
                "&?lng=" + results.rows.item(i).observation_longitude;
            }
        }, null);
        });
    },

    //On modifier un tuple déjà existant grâce a son id
    updateFormCot: function(observer_name, observer_tel, observer_email, 
                            observation_datetime, observation_location, 
                            observation_localisation, observation_region, observation_country, 
                            observation_latitude, observation_longitude, 
                            observation_number, observation_culled, 
                            counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                            depth_range0, depth_range1, depth_range2, 
                            observation_method0, observation_method1, 
                            remarks, id, save) {
        //var cotsDb = window.openDatabase("cotvt_admin", "1.0", "COT table", 1024*1000);
        
        var depth_range = ( depth_range0.length > 0 ? depth_range0 : "")
                    +((depth_range0.length > 0 && depth_range1.length > 0) ? ", " : ((depth_range0.length>0 && depth_range2.length > 0) ? ", " : ""))
                    +(depth_range1.length>0?depth_range1:"")
                    +(depth_range1.length>0 && depth_range2.length>0?", ":"")
                    +(depth_range2.length>0?depth_range2:"");
        var observation_method = (observation_method0.length > 0 ? observation_method0 : "")
                    +((observation_method0.length>0 && observation_method1.length) > 0 ? ", " : "")
                    +(observation_method1.length>0?observation_method1:"");

        //cotsDb.transaction(function(transaction) {
            db.executeSQL(sql.UPDATEFORM, 
                [    observer_name, observer_tel, observer_email, 
                    observation_datetime, observation_location, 
                    observation_localisation, observation_region, observation_country, 
                    observation_latitude, observation_longitude, 
                    observation_number, observation_culled, 
                    counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
                    depth_range, observation_method, 
                    remarks, id], 
                function(transaction, results) {
                    return db.synchronizeCOTs("form", id, save);
                }, function(e) {
                    return 0;
                }
            );
       // });
    }
}
