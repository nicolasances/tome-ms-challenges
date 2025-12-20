# Tome Challenges

This microservice provides APIs to manage Tome Challenges.

## The Structure of Challenges
Tome Challenges can be on different levels: 

* **Topic Challenges**. Topic Challenges are specifically related to the Topic as a whole. <br>
They cannot be framed on a single part of a topic. <br>
An example of a Topic Challenge could be, for a *historical topic* a challenge that asks the user to reconstruct a genealogic tree that spans across the entire topic. 

* **Section Challenges**. Section Challenges are specifically related to a specific section within a Topic. <br>
An example of a Section Challenge could be, for a *historical topic*, a challenge that asks the user to answer questions about a specific historical event described in a section of the topic.<br>
Often, topics are complex enough to be divided in sections and to properly remember a topic, one needs to be able to remember more detailed aspects, hidden within those sections. <br>
**Section Challenges** allow for the memorization of those more detailed aspects and are designed to go into those details.

* **General Challenges**. General Challenges are not specifically related to a single Topic or Section. <br>
They tend to bridge topics and are more complex in the sense that they require knowledge that spans across multiple topics, they test the capacity to link topics together and provide a holistic view that spans over disciplines, time horizons and geographies. <br>

## Trials
Trials are attempts to solve Challenges. <br>
Trials are linked to a specific Challenge and contain the user's answers to that Challenge. <br>

### Time Expiry & Spaced Repetition
Trials typically have a **time expiry**. <br>
That means that once completed the **Trial's results will only be valid for a period of time**. <br>

That is a REALLY IMPORTANT concept, at the core of Tome's learning philosophy. <br>
The idea is that **memory fades away with time** and that to really master knowledge, one needs to **revisit knowledge periodically**. <br>
Therefore, Trials' results are designed to **expire** after a certain time period. <br>  

Each Challenge is different, therefore each Challenge can define its own **Trial Expiry Period**. <br>
After that period, the Trial is considered **expired** and the user needs to re-attempt the Challenge to re-validate their knowledge. <br>
This allows Tome to implement **spaced repetition** techniques to maximize long-term retention of knowledge.

