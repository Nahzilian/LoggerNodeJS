/**
 * Created by sriyanw on 15-07-09.
 */

function hello(req, res, next)
{
    console.log("Hello from Test")
    return res.status(200).send("Hello");
}

module.exports.hello = hello;
