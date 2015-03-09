package models

/**
 * Created by Jörg Amelunxen on 11.11.14.
 */
case class TopicModel(uID: String,
                      name: String,
                      group: String,
                      createdBy: String,
                      content: String,
                      status: String,
                      constraints: Array[String],
                      deadline: String,
                      tagStore: Array[String],
                      linkedTopics: Array[String],
                      maxCharThreshold: String,
                      gps : Array[String],
                      metaStore: String,
                      nextTextBlock: Array[String])
