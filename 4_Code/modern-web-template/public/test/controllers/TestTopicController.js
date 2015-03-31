/**
 * Created by Jörg Amelunxen on 14.12.14.
 */

describe('Testsuite for the TopicController:', function () {
    var controller = null, $scope = null, $httpBackend = null, neededService = null;
    var gc = {};
    var routeParams = {};
    routeParams.topicID = 1;
    routeParams.userID = "anUser";

    function initTestVariables() {
        var imageLink = "<img src=\"http://blog.recrutainment.de/wp-content/uploads/2012/06/Lorem_Ipsum_Jung_von_Matt.png\" alt=\"dummyPic\">";
        var demoTopic1 = {
            uID: "1",
            name: "aTopic",
            group: "groupID1",
            createdBy: "anUser",
            content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
                imageLink +
                "sed diam nonumy eirmod tempor " +
                imageLink +
                "invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
            status: "wip",
            constraints: ["constraintA"],
            deadline : "2020-01-14T23:00:00.000Z",
            tagStore: [],
            linkedTopics: []
        };

        var demoTopic2 = {
            uID: "2",
            name: "aTopic2",
            group: "groupID1",
            createdBy: "anUser",
            content: "...",
            status: "wip",
            constraints: ["constraintA"],
            deadline : "2013-01-14T23:00:00.000Z",
            tagStore: "-1",
            linkedTopics: ["someUID"]
        };

        var demoSubTopic = {
            uID: "3",
            name: "aSubTopic",
            group: "groupID1",
            createdBy: "1",
            content: "...",
            status: "done",
            constraints: ["constraintA"],
            deadline : "2015-01-14T23:00:00.000Z",
            tagStore: "-1",
            linkedTopics: [],
            metaStore: "uID554"
        };

        var demoConstraint = {
            uID: "constraintA",
            name: "character_limitation",
            topic: "1",
            valueInTopic: "0",
            value: "0",
            fulfilled: true
        };

        var demoConstraint2 = {
            uID: "constraintB",
            name: "max_character_limitation",
            topic: "1",
            valueInTopic: "1000",
            value: "100",
            fulfilled: false
        };

        var demoConstraint3 = {
            uID: "constraintC",
            name: "img_limitation",
            topic: "1",
            valueInTopic: "0",
            value: "0",
            fulfilled: true
        };

        var footnote1 = {
            uID: "footnote1",
            content: "Foot1",
            creator: "JonDoe@dummy.com",
            linkedToTopic: "1"
        };

        var footnote2 = {
            uID: "footnote2",
            content: "Foot2",
            creator: "JonDoe@dummy.com",
            linkedToTopic: "1"
        };

        var media1 = {
            uID: "media1",
            topic: "1"
        };

        var historyObject = {
            uID: "his1",
            content: "Bla",
            editor: "John Doe",
            topicID: "1",
            versionNumber: "2"
        };

        var lock1 = {
            topicUID: "1",
            lastChange: new Date().getTime()+""
        };

        var typeObject = {
            uID: "uID_new",
            name: 'newName',
            extendsType: 'root',
            system: false,
            keys: ['ownAttr'],
            values: ['myValue']
        };

        var storageObject = {
            uID: "uID_store",
            list: ["type#test"]
        };

        return {demoTopic1: demoTopic1, demoTopic2: demoTopic2,
            demoSubTopic: demoSubTopic, demoConstraint: demoConstraint,
            footnote1: footnote1, footnote2: footnote2,
            media1: media1, historyObject: historyObject,
            demoConstraint2: demoConstraint2,
            demoConstraint3: demoConstraint3,
            lock1: lock1,
            type: typeObject,
            store: storageObject};
    }

    var __ret           = initTestVariables();
    var demoTopic1      = __ret.demoTopic1;
    var demoTopic2      = __ret.demoTopic2;
    var demoSubTopic    = __ret.demoSubTopic;
    var demoConstraint  = __ret.demoConstraint;
    var demoConstraint2 = __ret.demoConstraint2;
    var demoConstraint3 = __ret.demoConstraint3;
    var demoTopicList   = [demoTopic1, demoTopic2];

    var demoFootnote1   = __ret.footnote1;
    var demoFootnote2   = __ret.footnote2;
    var media1          = __ret.media1;
    var historyObject   = __ret.historyObject;

    var lock1           = __ret.lock1;

    var type            = __ret.type;

    var store           = __ret.store;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;

        $httpBackend.when('GET', '/admin/types')
            .respond([type]);

        $httpBackend.when('GET', '/admin/kv/undefined')
            .respond([store]);

        $httpBackend.when('GET', '/admin/topic')
            .respond(demoTopicList);

        $httpBackend.when('GET', '/admin/lock/1')
            .respond([lock1]);

        $httpBackend.when('GET', '/admin/topicbyuser/anUser')
            .respond(demoTopicList);

        $httpBackend.when('GET', '/admin/topicbyuser/1')
            .respond([demoSubTopic]);

        $httpBackend.when('GET', '/admin/topicbyuser/2')
            .respond([demoTopic2]);

        $httpBackend.when('GET', '/admin/topic/1')
            .respond([demoTopic1]);

        $httpBackend.when('GET', '/admin/constraints/1')
            .respond([demoConstraint, demoConstraint2, demoConstraint3]);

        $httpBackend.when('POST','/admin/constraints')
            .respond(200,{});

        $httpBackend.when('PUT','/admin/constraints')
            .respond(200,{});

        //$httpBackend.when('POST','/admin/topic')
        //    .respond(200,{});

        $httpBackend.when('GET','/admin/footnotesByTopic/1')
            .respond(200,[demoFootnote1,demoFootnote2]);

        $httpBackend.when('GET','/admin/history/1')
            .respond(200,[historyObject]);

        $scope = $rootScope.$new();

        /* Mock user controller */
        var uc = {};
        uc.email = "anUser";

        /* Mock for group controller */
        gc.setTopicAtGroup = function(){};
        gc.createNotificationAtGroup = function(){};
        gc.createNotificationAtGroupAndSetTopic = function(){};

        /* add mocked user controller resp.
         group controller to scope */
        $scope.uc = uc;
        $scope.gc = gc;

        /* create controller */
        controller = $controller('TopicCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });

        // get the needed Service
        var $injector = angular.injector([ 'myApp.services' ]);
        neededService = $injector.get( 'commonTaskService' );

        var __ret           = initTestVariables();
        demoTopic1          = __ret.demoTopic1;
        demoTopic2          = __ret.demoTopic2;
        demoSubTopic        = __ret.demoSubTopic;
        demoConstraint      = __ret.demoConstraint;

        demoFootnote1       = __ret.footnote1;
        demoFootnote2       = __ret.footnote2;

        media1              = __ret.media1;

        type                = __ret.type;

        store               = __ret.store;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initController() {
        $httpBackend.expectGET('/admin/pictureForTopic/1').respond(200,[media1]);

        $httpBackend.flush();

        /* check getTopicByTopicID */
        expect(controller.currentTopic.uID).toBe('1');
        expect(controller.currentTopic.name).toBe('aTopic');

        /* check getTopicsByUserID */
        expect(controller.currentUserTopics[0].uID).toBe('1');
        expect(controller.currentUserTopics[0].name).toBe('aTopic');

        /* check getConstraintsForThisTopic */
        expect(controller.constraintsForThisTopic[0].uID).toBe('constraintA');

        /* check version number */
        expect(controller.topicVersion).toBe('2');
    }

    it('fetches the topic data on init', function () {
        initController();
    });

    it('updates a topic with the updateTopic function', function () {
        initController();

        /* update */
        controller.updateTopic();

        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});
        $httpBackend.flush();
    });

    it('updates a topic with the updateStatus function', function (){
        initController();

        /* mock for alert controller and
        language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(){};

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.updateStatus(mockAC,mockLC,msg);

        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.expectPUT('/admin/constraints')
            .respond(200,{});

        $httpBackend.expectPOST('/admin/history').respond(200,{});

        /* store the potentially new max_char_value threshold */
        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.flush();

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('deletes the current topic with the deleteCurrentTopic function and includes sub-topics ' +
        'within this process', function () {
        initController();

        /* prepare controller
         => set the needed String representation manually
         */
        controller.modifyTopicID = demoTopic1.uID;

        controller.deleteCurrentTopic();

        $httpBackend.expectDELETE('/admin/topic/'+demoTopic1.uID)
            .respond(200,{});

        /* expect deletion of the kv of the main topic */
        $httpBackend.expectDELETE('/admin/kv/')
            .respond(200,{});

        /* expect deletion of subtopic and the chat system */
        $httpBackend.expectDELETE('/admin/topic/'+demoSubTopic.uID)
            .respond(200,{});

        /* expect deletion of chat system */
        $httpBackend.expectDELETE('/admin/chat/'+demoTopic1.uID)
            .respond(200,{});

        /* expect deletion of history */
        $httpBackend.expectDELETE('/admin/history/'+demoTopic1.uID)
            .respond(200,{});

        /* expect deletion of chat system */
        $httpBackend.expectDELETE('/admin/chat/'+demoSubTopic.uID)
            .respond(200,{});

        /* expect deletion of the kv of the sub topic */
        $httpBackend.expectDELETE('/admin/kv/uID554')
            .respond(200,{});
        
        /* expect deletion of history */
        $httpBackend.expectDELETE('/admin/history/'+demoSubTopic.uID)
            .respond(200,{});

        $httpBackend.flush();
    });

    it('creates a new topic with the create topic function', function() {
        initController();

        spyOn(gc,'createNotificationAtGroupAndSetTopic');

        /* prepare controller */
        controller.currentTopicSubTopicsAsString = "";

        /* create topic */
        controller.createTopic();

        expect(gc.createNotificationAtGroupAndSetTopic).toHaveBeenCalled();

        /* create both topics */
        $httpBackend.expectPOST('/admin/topic').respond(200,{});
        $httpBackend.expectPOST('/admin/topic').respond(200,{});


        /* expect the creation of the chat */
        $httpBackend.expectPOST('/admin/chat/true').respond(200,{});

        /* expect creation of both history objects */
        $httpBackend.expectPOST('/admin/history').respond(200,{});
        $httpBackend.expectPOST('/admin/history').respond(200,{});
        $httpBackend.flush();

    });

    it('checks if the Group id of the currently loaded topic is set with the' +
        'currentTopicGroupIdIsSet function', function () {
        initController();

        controller.currentTopic.groupID = "anID";

        expect(controller.currentTopicGroupIdIsSet()).toBe(true);
    });

    it('checks if the Group id of the currently loaded topic is set with the' +
        'currentTopicGroupIdIsSet function and returns false iff it is not' +
        'the case', function () {
        initController();

        controller.currentTopic.groupID = undefined;

        expect(controller.currentTopicGroupIdIsSet()).toBe(false);
    });

    it('is able to send a new alert to the alert system with the sendAlert function', function () {
        initController();

        /* mock for alert controller and
         language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(){};

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.sendAlert(mockAC,mockLC,msg);

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('is able to update the constraints of the current topic with the ' +
        'updateConstraints function if the constraint is a character_limitation' +
        ' constraint - with empty topic', function () {
        initController();

        controller.updateConstraints();

        var constraintInController = controller.constraintsForThisTopic[0];

        var checkAgainstThisConstraint = constraintInController;

        /* update length */
        checkAgainstThisConstraint.valueInTopic = ""+demoTopic1.content.length;

        /* expect and check the PUT request */
        $httpBackend.expectPUT('/admin/constraints', checkAgainstThisConstraint)
            .respond(200,{});

        /* store the potentially new max_char_value threshold */
        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.flush();
    });

    it('is able to update the constraints of the current topic with the ' +
        'updateConstraints function if the constraint is a img_limitation' +
        ' constraint', function () {
        initController();

        /* modify constraint to a image limitation one */
        controller.constraintsForThisTopic[0].name          = "img_limitation";
        controller.constraintsForThisTopic[0].valueInTopic  = "0";

        /* modify topic content */
        controller.currentTopic.content = "<img>";

        /* call the update function */
        controller.updateConstraints();

        var constraintInController = controller.constraintsForThisTopic[0];

        var checkAgainstThisConstraint = constraintInController;

        /* update length */
        checkAgainstThisConstraint.valueInTopic = "1";

        /* expect and check the PUT request */
        $httpBackend.expectPUT('/admin/constraints', checkAgainstThisConstraint)
            .respond(200,{});

        /* store the potentially new max_char_value threshold */
        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.flush();
    });

    it('is able to check if the constraints for the current topic are fulfilled', function () {
        initController();

        expect(controller.constraintsFulfilled()).toBe(true);
    });

    it('is able to check if the constraints for the current topic are fulfilled' +
        'and returns false if it is not the case', function () {
        initController();

        controller.constraintsForThisTopic[0].fulfilled = false;

        expect(controller.constraintsFulfilled()).toBe(false);
    });

    it('updates the status iff all constraints are fulfilled', function () {
        initController();

        /* mock for alert controller and
         language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(){};

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.updateStatusIfAllowedByContraints(mockAC,mockLC,msg);

        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.expectPUT('/admin/constraints')
            .respond(200,{});

        $httpBackend.expectPOST('/admin/history').respond(200,{});

        /* store the potentially new max_char_value threshold */
        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.flush();

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('updates the status iff all constraints are fulfilled and sends an alert ' +
        'if not all constraints are fulfilled', function () {
        initController();

        controller.constraintsForThisTopic[0].fulfilled = false;

        /* mock for alert controller and
         language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(term){
            if(term == 'notification_alert_failDueToContraints'){
                return "notification_alert_failDueToContraints";
            }
            else{
                return "unknown";
            }
        };

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.updateStatusIfAllowedByContraints(mockAC,mockLC,msg);

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('is able to fill the list of pictures for a given topic content', function () {
        initController();

        /*
        controller.preparePictureList(); is implicitly done in the
        init process */

        expect(controller.listOfPictures.length).toBe(2);
    });

    it('is able to check if the current time is before the deadline', function () {
        initController();

        var deadlineReached = controller.deadlineReached();

        expect(deadlineReached).toBe(false);
    });

    it('is able to check if the current time is after the deadline', function () {
        initController();

        controller.currentTopic.deadline = "2013-01-14T23:00:00.000Z";

        var deadlineReached = controller.deadlineReached();

        expect(deadlineReached).toBe(true);
    });

    it('is able to download topics by a given status', function () {
        initController();

        controller.getTopicsByStatus('done');

        $httpBackend.expectGET('/admin/topicbystatus/done').respond(200,demoSubTopic);
        $httpBackend.flush();
    });

    it('is able to get the footnotes for a given topic', function () {
        initController();

        /*
         controller.getFootnotes(uID); is implicitly done in the
         init process */

        expect(controller.footnotes.length).toBe(2);
    });

    it('is able to save a new footnote', function () {
        initController();

        var contentOfTheFootnote = "I am a footnote";
        var note = neededService.createFootnote(neededService.generateUID(contentOfTheFootnote), contentOfTheFootnote,
                                            "dummy@dummy.com","1");

        controller.storeFootnote(note);

        $httpBackend.expectPOST('/admin/footnote',note).respond(200,{});
        $httpBackend.flush();
    });

    it('is able to delete a specific footnote', function () {
        initController();

        controller.deleteFootnote("footnote1");

        $httpBackend.expectDELETE('/admin/footnote/footnote1').respond(200,{});
        $httpBackend.flush();
    });

    it('is able to fetch the Media list for a topic', function () {
        initController();

        /*
         controller.getMediaForTopic(topicID); is implicitly done in the
         init process */

        expect(controller.media.length).toBe(1);
    });

    it('is able to append a String to the current topic', function () {
        initController();

        var appendThis = "AppendMe";
        var oldContent = demoTopic1.content;

        controller.appendToContent(appendThis);

        expect(controller.currentTopic.content).toBe(oldContent + appendThis);
    });

    it('is able to push a new media file to the controller', function () {
        initController();

        var mediaDummy = {uID: 'DummyMedia'};

        controller.pushNewMedia(mediaDummy);

        var upper  = controller.media.pop();

        expect(upper.uID).toBe("DummyMedia");
    });

    it('is able to create a new/empty history for a given topicID', function () {
        initController();

        var topicID = "1";
        controller.initHistory(topicID);

        $httpBackend.expectPOST('/admin/history').respond(200,{});
        $httpBackend.flush();
    });


    it('is able to remove the history of a topic', function () {
        initController();

        controller.deleteHistory('1');

        $httpBackend.expectDELETE('/admin/history/1').respond(200,{});
        $httpBackend.flush();
    });

    it('is able to evaluate the green max_character_constraint', function () {
        initController();

        /* set */
        controller.maxchar = 600;

        /* use */
        var maxCharStatus   = controller.evaluateMaxCharConstraint(80);

        /* evaluate */
        expect(maxCharStatus).toBe("yellow")
    });

    it('is able to evaluate the yellow max_character_constraint', function () {
        initController();

        /* set */
        controller.maxchar = 400;

        /* use */
        var maxCharStatus   = controller.evaluateMaxCharConstraint(80);

        /* evaluate */
        expect(maxCharStatus).toBe("green")
    });

    it('is able to evaluate the red max_character_constraint', function () {
        initController();

        /* set */
        controller.maxchar = 378;

        /* use */
        var maxCharStatus   = controller.evaluateMaxCharConstraint(80);

        /* evaluate */
        expect(maxCharStatus).toBe("red")
    });

    it('is able to evaluate the green max_character_constraint with modified treshold', function () {
        initController();

        /* set */
        controller.maxchar = 600;

        /* use */
        var maxCharStatus   = controller.evaluateMaxCharConstraint(10);

        /* evaluate */
        expect(maxCharStatus).toBe("green")
    });

    it('is able to evaluate the red max_character_constraint with a negative number', function () {
        initController();

        /* set */
        controller.maxchar = -10;

        /* use */
        var maxCharStatus   = controller.evaluateMaxCharConstraint(80);

        /* evaluate */
        expect(maxCharStatus).toBe("red")
    });

    it('is able to create a new link to a topic', function () {
        initController();

        var targetUID = "2";

        controller.addLink(targetUID);

        var modObj = jQuery.extend(true, {}, demoTopic1);
        modObj.linkedTopics.push("2");

        $httpBackend.expect('GET', '/admin/topic/1').respond(200,[demoTopic1]);
        $httpBackend.expect('PUT','/admin/topic', modObj).respond(200,{});
        $httpBackend.flush();
    });

    it('is able to remove a link from a topic', function () {
        initController();

        controller.currentTopic = demoTopic2;

        controller.linksOfThisTopic.push({
            uID: "SomeUID",
            name: "FollowTheWhiteRabbit"
        });

        var targetUID = "SomeUID";

        controller.removeLink(targetUID);

        var goal = jQuery.extend(true, {}, demoTopic2);
        goal.linkedTopics = [];

        $httpBackend.expect('GET', '/admin/topic/2').respond(200,[demoTopic2]);
        $httpBackend.expect('PUT','/admin/topic',goal).respond(200,{});
        $httpBackend.flush();

        expect(controller.linksOfThisTopic.length).toBe(0);
    });

    it('is able to translate a topic ID into its name', function () {
        initController();

        controller.nameOfTopic("2", function(name){
            expect(name).toBe("aTopic2");
        });

        $httpBackend.expect('GET','/admin/topic').respond(200,[demoTopic1,demoTopic2]);
        $httpBackend.flush();
    });

    it('is able to add a new tag to the tag array', function () {
        initController();

        controller.createTag("dummy");
        expect(controller.currentTopic.tagStore[0]).toBe("dummy");

        /* expect sending to backend */
        $httpBackend.expect('PUT','/admin/topic').respond(200,{});
        $httpBackend.flush();
    });

    it('is able to remove a tag given by its index', function () {
        initController();

        controller.currentTopic.tagStore[0] = "RemoveMe";

        controller.removeTag(0);

        expect(controller.currentTopic.tagStore[0]).toBe(undefined);

        /* expect sending to backend */
        $httpBackend.expect('PUT','/admin/topic').respond(200,{});
        $httpBackend.flush();
    });

    it('is able to create a copy of a given topic', function () {
        initController();

        controller.copyTopic('1');

        $httpBackend.expect('POST', '/admin/topic').respond(200,{});
        $httpBackend.expect('POST', '/admin/topic').respond(200,{});
        $httpBackend.expect('POST', '/admin/history').respond(200,{});
        $httpBackend.expect('POST', '/admin/history').respond(200,{});
        $httpBackend.flush();
    });
});