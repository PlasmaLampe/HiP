/**
 * Created by Jörg Amelunxen on 28.11.14.
 */
    //FIXME put this into services
var DEBUG = true;

var Interface = {};
var Tooling = {};
Tooling.lastGeneratedRandomUID = "";

Interface.possibleContraints = ["character_limitation","img_limitation"];

/**
 * Adds the fitting language term to a given constraint in JSON format
 *
 * @param constraintJSON    the constraint in JSON format that should get the
 *                          language term
 */
Interface.addLanguageTermToConstraint = function (constraintJSON) {
    if (constraintJSON.name == 'character_limitation') {
        constraintJSON.languageTerm = 'system_amount_chars';
    } else if (constraintJSON.name == 'img_limitation') {
        constraintJSON.languageTerm = 'system_amount_pics';
    }
};

/**
 * Generates a uID for a given input String
 *
 * @param inputString   some text, e.g., a group name
 * @returns {string}    the corresponding -random- uID
 */
Tooling.generateUID = function(inputString){
    var timestamp = Math.round(new Date().getTime() / 1000);

    var uID = Sha1.hash(inputString + Math.floor((Math.random() * 100000) + 1) + timestamp);
    Tooling.lastGeneratedRandomUID = uID;
    return uID;
};

/**
 * Creates all needed/possible constraints for a given topic in JSON format
 *
 * @param $http         dependency needed for posting data to the REST interface
 * @param subTopicJSON  the corresponding topic in JSON format
 */
Interface.createConstraints = function($http, subTopicJSON){
    Interface.possibleContraints.forEach(function(constraint){
        var constraintJSON = {
            uID: Tooling.generateUID(constraint),
            name: constraint,
            topic: subTopicJSON.uID,
            valueInTopic: "0",
            value: "0",
            fulfilled: true
        };

        Interface.addLanguageTermToConstraint(constraintJSON);
        subTopicJSON.constraints.push(constraintJSON.uID);

        if (DEBUG){
            console.log("info TopicController: posting constraint ");
            console.log(constraintJSON);
        }

        $http.post('/admin/constraints', constraintJSON).
            success(function (data, status, headers, config) {
            }).
            error(function (data, status, headers, config) {
            });
    });
};

/**
 * Creates a new topic with the given information
 *
 * @param topicname             the name of the topic
 * @param subTopicsAsString     all sub topics
 * @param groupID               the id of the group that works on this topic
 * @param refToGrpController    reference to group controller
 * @param mainTopicCreatedBy    creator of the main topic
 * @param $http                 reference to the http interface
 */
Interface.createTopic = function (topicname, subTopicsAsString, groupID, refToGrpController, mainTopicCreatedBy, $http) {
    var currentTopicID = Tooling.generateUID(topicname);

    /* create all sub-topics */
    if(subTopicsAsString == undefined)
        subTopicsAsString = "";
    else{
        var subtopics = subTopicsAsString.split(',');
        subtopics.forEach(function (subTopic) {
            var currentSubTopicID = Tooling.generateUID(subTopic);

            var subTopicJSON = {
                uID: currentSubTopicID,
                name: subTopic,
                group: groupID,
                createdBy: currentTopicID,
                content: "",
                constraints: [],
                status: "wip"
            };

            Interface.createConstraints($http, subTopicJSON);

            $http.post('/admin/topic', subTopicJSON).
                success(function (data, status, headers, config) {
                }).
                error(function (data, status, headers, config) {
                });
        });
    }

    /* create actual main topic */
    var topic = {
        uID: currentTopicID,
        name: topicname,
        group: groupID,
        createdBy: mainTopicCreatedBy,
        content: "",
        status: "wip",
        constraints: []
    };

    Interface.createConstraints($http, topic);

    if (DEBUG){
        console.log("info TopicController: posting topic with name: " + topic.name)
    }

    // post
    $http.post('/admin/topic', topic).
        success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    if (groupID != "" || groupID != "undefined") {
        // adding topic to group
        refToGrpController.setTopicAtGroup(groupID, currentTopicID);

        // adding notification
        if (DEBUG) {
            console.log("info TopicController: posting notification to group with ID " + groupID);
        }

        refToGrpController.createNotificationAtGroup(groupID, "system_notification_groupTopicChanged",[topicname])
    }
};


