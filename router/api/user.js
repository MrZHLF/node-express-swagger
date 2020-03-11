const express = require('express')
const gravatar = require('gravatar') //生成头像
const bcrypt = require('bcryptjs') //加密
const jwt = require('jsonwebtoken') //token
const User = require('./../../models/User')
const key = require('../../config/db')

/**
 * 用户信息注册
 * @route POST /api/users/register
 * @group user - Operations about user
 * @param {string} username.query.required - 请输入用户名
 * @param {number} password.query.required - 请输入密码
 * @param {string} email.query.required - 请输入合法邮箱
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */

exports.userRegisterPost = function(req, res) {
  console.log(req)
  // 查询邮箱是否注册
  res.setHeader('Content-Type', 'application/json;charset=utf-8')
  User.findOne({
    email: req.query.email
  })
    .then(user => {
      if (user) {
        // 邮箱已经注册了
        return res.status(400).json('邮箱已经被注册')
      } else {
        // 生成默认头像
        const avatar = gravatar.url(req.query.email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        })
        const newUser = new User({
          username: req.query.username,
          password: req.query.password,
          email: req.query.email,
          avatar
        })
        // 对密码加密
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err
            }
            // 密码加密
            newUser.password = hash
            newUser
              .save()
              .then(user => {
                res.json(user)
              })
              .catch(err => {
                console.log(err)
              })
          })
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

/**
 * 用户信息登录
 * @route POST /api/users/login
 * @group user - Operations about user
 *  @param {string} email.query.required - 请输入合法邮箱
 * @param {number} password.query.required - 请输入密码
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
exports.userLoginPost = function(req, res) {
  const email = req.query.email
  const password = req.query.password
  User.findOne({
    email: req.query.email
  }).then(user => {
    // 查询邮箱是否注册
    if (!user) {
      return res.status(400).json('用户不存在')
    }
    // 密码匹配校验
    bcrypt.compare(password, user.password).then(isMath => {
      if (isMath) {
        const rule = {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
        jwt.sign(
          rule,
          key.secretOrKey,
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err
            res.json({
              success: true,
              token: 'Bearer ' + token, //最后返回的token
              code: 200,
              msg: '成功'
            })
          }
        )
      } else {
        return res.status(400).json('密码不存在')
      }
    })
  })
}
