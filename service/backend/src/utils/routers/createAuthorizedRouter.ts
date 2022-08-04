import * as trpc from '@trpc/server'

import { Context } from '@/context'

const createAuthorizedRouter = () =>
	trpc.router<Context>().middleware(async ({ path, ctx, next }) => {
		const { jwt, authorization } = ctx
		if (!authorization)
			throw new trpc.TRPCError({
				code: 'UNAUTHORIZED',
				cause: 'AuthorizationHeaderNotFound',
				message: 'HTTP Authorization header is missing',
			})
		const token = authorization.match(/Bearer (.+)/)?.[1]
		if (!token)
			throw new trpc.TRPCError({
				code: 'UNAUTHORIZED',
				cause: 'TokenNotFound',
				message: 'HTTP Authorization header is missing token',
			})
		const value = await jwt.verify(token)
		if (!value)
			throw new trpc.TRPCError({
				code: 'UNAUTHORIZED',
				cause: 'InvalidToken',
				message: 'JWT is invalid',
			})
		return next({
			ctx: {
				...ctx,
				user: value.user,
			},
		})
	})

export default createAuthorizedRouter
