import Link from 'next/link';
export default class ChannelGrid extends React.Component {
	render() {
		const { channels } = this.props;
		return (
			<div className='channels'>
				{channels.map((channel) => (
					<Link href={`/channel?id=${channel.id}`}>
						<a className='channel'>
							<img src={channel.urls.logo_image.original}></img>
							<p>{channel.title}</p>
						</a>
					</Link>
				))}

				<style jsx>
					{`
						.channels {
							display: grid;
							grid-gap: 15px;
							padding: 15px;
							grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
						}

						.channel {
							display: block;
							border-radius: 3px;
							box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
							margin-bottom: 0.5em;
						}

						.channel img {
							width: 100%;
						}

						h2 {
							padding: 5px;
							font-size: 0.9em;
							font-weight: 600;
							margin: 0;
							text-align: center;
						}
					`}
				</style>
			</div>
		);
	}
}
