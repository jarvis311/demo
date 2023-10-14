import AWS from 'aws-sdk'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

const catchError = (msg) => {
    return ({
        status: false,
        response_code: 400,
        response_message: msg
    })
}

const findError = (msg) => {
    return ({
        status: false,
        response_code: 400,
        response_message: msg
    })
}

const macthError = (msg) => {
    return ({
        status: false,
        response_code: 600,
        response_message: msg
    })
}
const requiredError = (msg) => {
    return ({
        status: false,
        response_code: 400,
        response_message: msg
    })
}

const successResponse = (msg) => {
    return ({
        status: true,
        response_code: 200,
        response_message: msg
    })
}

const dataResponse = (msg, data) => {
    return ({
        status: true,
        response_code: 200,
        response_message: msg,
        data: data
    })
}

const AuthError = (msg) => {
    return ({
        status: false,
        response_code: 429,
        response_message: msg
    })
}

const CreateBcryptPassword = async function (password) {
    try {
        var hash_password = await bcrypt.hash(password, 10)
        return hash_password
    } catch (error) {
        console.log(error)
    }
}

const CheckBcryptPassword = async function (password, hashpassword) {
    try {
        const CheckPassword = await bcrypt.compare(password, hashpassword)
        return CheckPassword
    } catch (error) {
        console.log(error)
    }
}

const ImageUpload = async function (folder, file) {
    try {
        const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
        const s3 = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId: process.env.DO_SPACES_KEY,
            secretAccessKey: process.env.DO_SPACES_SECRET,
        });

        var Extension = file.name.split(".")
        var Filename = Date.now() + "." + Extension[Extension.length - 1]

        const digiCridential = {
            Bucket: config.DO_SPACES_BUCKET,
            folder: config.DO_SPACE_FOLDER_DIGITAL,
            Key: `${config.DO_SPACE_FOLDER_DIGITAL}/${folder}/${Filename}`,
            Body: file.data,
            ACL: "public-read",
            region: config.DO_SPACES_REGION
        }

        const dataLoc = await s3.upload(digiCridential).promise()
        return dataLoc.Location

    } catch (error) {
        console.log(error)
    }
}

const ImageDelete = async function (folder, link) {
    try {
        const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
        const s3 = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId: process.env.DO_SPACES_KEY,
            secretAccessKey: process.env.DO_SPACES_SECRET,
        });

        var Filename = link.split("/")


        const digiCridential = {
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: `${config.DO_SPACE_FOLDER_DIGITAL}/${folder}/${Filename[Filename.length - 1]}`,
        }

        const dataLoc = await s3.deleteObject(digiCridential).promise()
        if (dataLoc) {
            return { status: true }
        }


    } catch (error) {
        console.log(error)
    }
}



export default { catchError, AuthError, findError, dataResponse, successResponse, requiredError, macthError, CreateBcryptPassword, CheckBcryptPassword, ImageUpload, ImageDelete }
