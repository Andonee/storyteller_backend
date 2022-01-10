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
	place: string
	description: string
	photo: any
	video: any
	link: any
	coords: any
	type: string
	place_id?: number
}
