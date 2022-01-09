export interface IAuthProps {
	login: string
	password: string
}

export interface IUserProps extends IAuthProps {
	id: number
	created_at: Date
}

export interface ILogIn {
	user: IUserProps[]
}

export interface IUserID {
	user_id: number
}

export interface IBodyMapProps {
	title: string
	description: string
	font: string
	panel_color: string
	icons: any
	panel_position: string
}

export interface IBodyPlaceProps {
	map_id: number
	place: string
	description: string
	photos: string[]
	video: string[]
	link: string[]
	coords: any
	type: string
}
